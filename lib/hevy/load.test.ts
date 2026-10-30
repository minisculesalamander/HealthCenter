import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EXERCISE_TEMPLATES } from "./catalog";
import { createFixtureFetch, HevyRequestError, loadHevyData, type FetchLike } from "./load";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe("Hevy loader", () => {
  it("uses the empty fixture without calling the network", async () => {
    let calls = 0;
    const fetchImpl: FetchLike = async () => {
      calls += 1;
      throw new Error("network");
    };
    const loaded = await loadHevyData({ apiKey: "  ", fixture: "empty", fetchImpl });
    expect(calls).toBe(0);
    expect(loaded.source).toBe("fixture");
    expect(loaded.fixtureName).toBe("empty");
    expect(loaded.snapshot.workoutCount).toBe(0);
    expect(loaded.snapshot.workouts).toEqual([]);
    expect(loaded.snapshot.routines).toHaveLength(12);
    expect(loaded.snapshot.exerciseTemplates.length).toBe(EXERCISE_TEMPLATES.length);
  });

  it("pages the sample fixture through the same client as the live API", async () => {
    const calls: { url: string; key: string | null }[] = [];
    const fetchImpl: FetchLike = async (input, init) => {
      const headers = new Headers(init?.headers);
      calls.push({ url: input, key: headers.get("api-key") });
      return createFixtureFetch("sample")(input);
    };
    const loaded = await loadHevyData({ apiKey: "secret-key", fetchImpl });
    expect(loaded.source).toBe("live");
    expect(loaded.snapshot.workouts).toHaveLength(11);
    expect(loaded.snapshot.routines).toHaveLength(12);
    expect(loaded.snapshot.workoutCount).toBe(11);
    expect(calls.length).toBeGreaterThan(4);
    expect(calls.every((call) => call.key === "secret-key")).toBe(true);
    expect(calls.some((call) => call.url.includes("/v1/workouts/count"))).toBe(true);
    expect(calls.some((call) => call.url.includes("/v1/workouts?page=2&pageSize=10"))).toBe(true);
    expect(calls.some((call) => call.url.includes("/v1/routines?page=2&pageSize=10"))).toBe(true);
    expect(calls.some((call) => call.url.includes("/v1/exercise_templates?page=1&pageSize=100"))).toBe(true);
    expect(calls.every((call) => !call.url.includes("secret-key"))).toBe(true);
    expect(JSON.stringify(loaded.snapshot)).not.toContain("secret-key");
  });

  it("accepts a count field and rejects a bad key without echoing it", async () => {
    const fetchImpl: FetchLike = async (input) => {
      if (input.endsWith("/v1/workouts/count")) return Response.json({ count: 0 });
      if (input.includes("/v1/workouts?")) return Response.json({ page: 1, page_count: 0, workouts: [] });
      if (input.includes("/v1/routines?")) return Response.json({ page: 1, page_count: 0, routines: [] });
      return Response.json({ page: 1, page_count: 0, exercise_templates: [] });
    };
    const loaded = await loadHevyData({ apiKey: "secret-key", fetchImpl });
    expect(loaded.snapshot.workoutCount).toBe(0);

    const denied: FetchLike = async () => new Response("denied secret-key", { status: 401 });
    await expect(loadHevyData({ apiKey: "secret-key", fetchImpl: denied })).rejects.toBeInstanceOf(HevyRequestError);
    await expect(loadHevyData({ apiKey: "secret-key", fetchImpl: denied })).rejects.toThrow(/401/);
    await expect(loadHevyData({ apiKey: "secret-key", fetchImpl: denied })).rejects.not.toThrow(/secret-key/);

    const offline: FetchLike = async () => {
      throw new Error("socket hang up for secret-key");
    };
    await expect(loadHevyData({ apiKey: "secret-key", fetchImpl: offline })).rejects.toThrow(/\[redacted\]/);
    await expect(loadHevyData({ apiKey: "secret-key", fetchImpl: offline })).rejects.not.toThrow(/secret-key/);
  });

  it("rejects an unknown fixture name", async () => {
    await expect(loadHevyData({ fixture: "production" })).rejects.toThrow(/HEVY_FIXTURE/);
  });

  it("keeps the API key out of UI source", () => {
    const files = [...walk(join(ROOT, "app")), ...walk(join(ROOT, "components"))];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toContain("HEVY_API_KEY");
      expect(text, file).not.toContain("api-key");
      expect(text, file).not.toContain("NEXT_PUBLIC_");
    }
    const server = readFileSync(join(ROOT, "lib/hevy/server.ts"), "utf8");
    expect(server).toContain('import "server-only"');
    expect(server).toContain("process.env.HEVY_API_KEY");
  });
});
