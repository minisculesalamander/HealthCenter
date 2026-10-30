import { emptySnapshot, sampleSnapshot } from "./fixtures";
import type { ExerciseTemplate, HevySnapshot, HevyWorkout, Routine } from "./types";

const HEVY_BASE = "https://api.hevyapp.com";
const WORKOUT_PAGE_SIZE = 10;
const ROUTINE_PAGE_SIZE = 10;
const TEMPLATE_PAGE_SIZE = 100;
const MAX_PAGES = 40;

export class HevyRequestError extends Error {
  status: number;
  path: string;

  constructor(path: string, status: number) {
    super(status === 401 ? "Hevy rejected the API key (401)." : `Hevy request failed for ${path} (${status}).`);
    this.name = "HevyRequestError";
    this.status = status;
    this.path = path;
  }
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type LoadedHevy = {
  source: "live" | "fixture";
  fixtureName: "empty" | "sample" | null;
  snapshot: HevySnapshot;
  warnings: string[];
};

type FixtureName = "empty" | "sample";

function pageOf<T>(items: T[], page: number, pageSize: number, key: string): Record<string, unknown> {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const pageCount = items.length === 0 ? 0 : Math.ceil(items.length / safeSize);
  const start = (safePage - 1) * safeSize;
  return {
    page: safePage,
    page_count: pageCount,
    [key]: items.slice(start, start + safeSize),
  };
}

/** In-memory stand-in for the documented collection endpoints. */
export function createFixtureFetch(name: FixtureName): FetchLike {
  const snapshot = name === "sample" ? sampleSnapshot() : emptySnapshot();
  return async (input) => {
    const url = new URL(input, HEVY_BASE);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    let body: unknown;
    if (url.pathname === "/v1/workouts/count") {
      body = { workout_count: snapshot.workoutCount };
    } else if (url.pathname === "/v1/workouts") {
      body = pageOf(snapshot.workouts, page, pageSize, "workouts");
    } else if (url.pathname === "/v1/routines") {
      body = pageOf(snapshot.routines, page, pageSize, "routines");
    } else if (url.pathname === "/v1/exercise_templates") {
      body = pageOf(snapshot.exerciseTemplates, page, pageSize, "exercise_templates");
    } else {
      return new Response("Not found", { status: 404 });
    }
    return Response.json(body);
  };
}

function redact(message: string, apiKey: string): string {
  return apiKey ? message.split(apiKey).join("[redacted]") : message;
}

async function fetchJson(fetchImpl: FetchLike, apiKey: string, path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImpl(`${HEVY_BASE}${path}`, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "network error";
    throw new Error(`Could not reach Hevy (${redact(detail, apiKey)}).`);
  }
  if (!response.ok) {
    throw new HevyRequestError(path.split("?")[0] ?? path, response.status);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Hevy ${path.split("?")[0]} returned a non-JSON response (${response.status}).`);
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Hevy ${label} response was not an object.`);
  }
  return value as Record<string, unknown>;
}

async function fetchAllPages<T>(
  fetchImpl: FetchLike,
  apiKey: string,
  resourcePath: string,
  pageSize: number,
  collectionKey: string,
): Promise<{ items: T[]; truncated: boolean }> {
  const first = asRecord(
    await fetchJson(fetchImpl, apiKey, `${resourcePath}?page=1&pageSize=${pageSize}`),
    resourcePath,
  );
  const declared = Number(first.page_count ?? 1);
  const pageCount = Number.isFinite(declared) && declared > 0 ? Math.floor(declared) : 1;
  const capped = Math.min(pageCount, MAX_PAGES);
  const items = Array.isArray(first[collectionKey]) ? [...(first[collectionKey] as T[])] : [];
  for (let page = 2; page <= capped; page += 1) {
    const body = asRecord(
      await fetchJson(fetchImpl, apiKey, `${resourcePath}?page=${page}&pageSize=${pageSize}`),
      resourcePath,
    );
    if (Array.isArray(body[collectionKey])) items.push(...(body[collectionKey] as T[]));
  }
  return { items, truncated: pageCount > MAX_PAGES };
}

function dedupeWorkouts(workouts: HevyWorkout[]): HevyWorkout[] {
  const seen = new Set<string>();
  return workouts.filter((workout) => {
    if (!workout || typeof workout.id !== "string" || seen.has(workout.id)) return false;
    seen.add(workout.id);
    return true;
  });
}

async function loadLive(fetchImpl: FetchLike, apiKey: string): Promise<LoadedHevy> {
  const warnings: string[] = [];
  const countBody = asRecord(await fetchJson(fetchImpl, apiKey, "/v1/workouts/count"), "/v1/workouts/count");
  const rawCount = countBody.workout_count ?? countBody.count;
  const workoutCount = Number(rawCount);
  if (!Number.isFinite(workoutCount)) {
    throw new Error("Hevy workout count response was not a number.");
  }

  const workoutsPage = await fetchAllPages<HevyWorkout>(
    fetchImpl,
    apiKey,
    "/v1/workouts",
    WORKOUT_PAGE_SIZE,
    "workouts",
  );
  const routinesPage = await fetchAllPages<Routine>(fetchImpl, apiKey, "/v1/routines", ROUTINE_PAGE_SIZE, "routines");
  const templatesPage = await fetchAllPages<ExerciseTemplate>(
    fetchImpl,
    apiKey,
    "/v1/exercise_templates",
    TEMPLATE_PAGE_SIZE,
    "exercise_templates",
  );

  if (workoutsPage.truncated) warnings.push("Workout history was truncated at the page cap.");
  if (routinesPage.truncated) warnings.push("Routine list was truncated at the page cap.");
  if (templatesPage.truncated) warnings.push("Exercise template list was truncated at the page cap.");

  const workouts = dedupeWorkouts(workoutsPage.items);
  if (workoutCount === 0 && workouts.length > 0) {
    warnings.push("Hevy reported 0 workouts, and the workout list was used instead.");
  }

  return {
    source: "live",
    fixtureName: null,
    warnings,
    snapshot: {
      workoutCount,
      workouts,
      routines: routinesPage.items,
      exerciseTemplates: templatesPage.items,
    },
  };
}

export async function loadHevyData(input: {
  apiKey?: string | null;
  fixture?: string | null;
  fetchImpl?: FetchLike;
}): Promise<LoadedHevy> {
  const apiKey = input.apiKey?.trim() ?? "";
  if (!apiKey) {
    const requested = input.fixture?.trim() || "empty";
    if (requested !== "empty" && requested !== "sample") {
      throw new Error(`Unknown HEVY_FIXTURE "${requested}". Use "empty" or "sample".`);
    }
    const loaded = await loadLive(createFixtureFetch(requested), "fixture");
    return {
      source: "fixture",
      fixtureName: requested,
      snapshot: loaded.snapshot,
      warnings: loaded.warnings,
    };
  }
  return loadLive(input.fetchImpl ?? fetch, apiKey);
}
