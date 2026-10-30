import { describe, expect, it } from "vitest";
import { sampleSnapshot } from "../hevy/fixtures";
import type { ExerciseTemplate, HevyExercise, HevySet, HevySnapshot, HevyWorkout } from "../hevy/types";
import {
  buildDashboard,
  calendarDate,
  classifyExercise,
  classifySet,
  currentStreak,
  estimated1RmKg,
  longestStreak,
  mondayOf,
  setVolumeKg,
} from "./compute";

const NOW = new Date("2026-10-30T18:00:00Z");

function set(partial: Partial<HevySet> & Pick<HevySet, "type">): HevySet {
  return {
    index: partial.index ?? 0,
    type: partial.type,
    weight_kg: partial.weight_kg ?? null,
    reps: partial.reps ?? null,
    distance_meters: partial.distance_meters ?? null,
    duration_seconds: partial.duration_seconds ?? null,
    rpe: partial.rpe ?? null,
    custom_metric: partial.custom_metric ?? null,
  };
}

function exercise(title: string, sets: HevySet[], templateId = "T1"): HevyExercise {
  return {
    index: 0,
    title,
    notes: null,
    exercise_template_id: templateId,
    superset_id: null,
    sets,
  };
}

function workout(id: string, start: string, exercises: HevyExercise[], end?: string): HevyWorkout {
  return {
    id,
    title: "Session",
    routine_id: null,
    description: null,
    start_time: start,
    end_time: end ?? new Date(new Date(start).getTime() + 60 * 60_000).toISOString(),
    updated_at: start,
    created_at: start,
    exercises,
  };
}

function snapshot(workouts: HevyWorkout[], templates: ExerciseTemplate[] = []): HevySnapshot {
  return {
    workoutCount: workouts.length,
    workouts,
    routines: [],
    exerciseTemplates: templates,
  };
}

const chest: ExerciseTemplate = {
  id: "T1",
  title: "Bench Press (Barbell)",
  type: "weight_reps",
  primary_muscle_group: "chest",
  secondary_muscle_groups: ["triceps"],
  equipment_category: "barbell",
  is_custom: false,
};

describe("classification and volume", () => {
  it("counts working strength sets and leaves warm-ups, plyos, and holds out", () => {
    const bench = exercise("Bench Press (Barbell)", [
      set({ type: "warmup", weight_kg: 40, reps: 10 }),
      set({ index: 1, type: "normal", weight_kg: 100, reps: 5 }),
      set({ index: 2, type: "dropset", weight_kg: 80, reps: 8 }),
      set({ index: 3, type: "failure", weight_kg: 80, reps: 4 }),
    ]);
    const jumps = exercise(
      "Jump Squat",
      [set({ type: "normal", reps: 5 }), set({ index: 1, type: "normal", reps: 5 }), set({ index: 2, type: "warmup", reps: 3 })],
      "JUMP",
    );
    const wall = exercise("Wall Sit", [set({ type: "normal", duration_seconds: 45, weight_kg: 10 }), set({ index: 1, type: "normal", duration_seconds: 45 })], "WALL");
    const dash = buildDashboard(
      snapshot(
        [workout("w1", "2026-10-19T15:00:00Z", [bench, jumps, wall])],
        [
          chest,
          { ...chest, id: "JUMP", title: "Jump Squat", type: "bodyweight_reps", primary_muscle_group: "quadriceps" },
          { ...chest, id: "WALL", title: "Wall Sit", type: "duration", primary_muscle_group: "quadriceps" },
        ],
      ),
      { timeZone: "UTC", now: NOW },
    );

    expect(dash.totals.volumeKg).toBe(100 * 5 + 80 * 8 + 80 * 4);
    expect(dash.totals.warmupSets).toBe(2);
    expect(dash.totals.plyoSets).toBe(2);
    expect(dash.totals.plyoContacts).toBe(10);
    expect(dash.totals.timedSets).toBe(2);
    expect(dash.totals.holdSeconds).toBe(90);
    expect(dash.totals.strengthSets).toBe(3);
    expect(dash.musclesPerWeek[0]?.groups).toEqual([{ muscle: "chest", sets: 3 }]);
    expect(dash.exercises.map((series) => series.title)).toEqual(["Bench Press (Barbell)"]);
  });

  it("uses the template muscle, then the plan title, then other", () => {
    const titled = exercise("Hack Squat", [set({ type: "normal", weight_kg: 100, reps: 5 })], "missing");
    const overridden = exercise("Hack Squat", [set({ type: "normal", weight_kg: 50, reps: 5 })], "T1");
    const unknown = exercise("Made-up Move", [set({ type: "normal", weight_kg: 20, reps: 8 })], "");
    const dash = buildDashboard(snapshot([workout("w", "2026-10-19T15:00:00Z", [titled, overridden, unknown])], [chest]), {
      timeZone: "UTC",
      now: NOW,
    });
    const groups = dash.musclesPerWeek[0]?.groups ?? [];
    expect(groups).toEqual([
      { muscle: "chest", sets: 1 },
      { muscle: "other", sets: 1 },
      { muscle: "quadriceps", sets: 1 },
    ]);
  });

  it("skips assisted-bodyweight load and duration-only exercises", () => {
    const assisted = exercise("Assisted Pull Up", [set({ type: "normal", weight_kg: 30, reps: 6 })], "ASSIST");
    const carry = exercise("Farmer Carry", [set({ type: "normal", duration_seconds: 30 })], "CARRY");
    const dash = buildDashboard(
      snapshot(
        [workout("w", "2026-10-20T15:00:00Z", [assisted, carry])],
        [
          { ...chest, id: "ASSIST", title: "Assisted Pull Up", type: "bodyweight_assisted", primary_muscle_group: "lats" },
          { ...chest, id: "CARRY", title: "Farmer Carry", type: "weight_reps", primary_muscle_group: "forearms" },
        ],
      ),
      { timeZone: "UTC", now: NOW },
    );
    expect(classifyExercise(carry)).toBe("timed");
    expect(dash.totals.volumeKg).toBe(0);
    expect(dash.totals.strengthSets).toBe(1);
    expect(dash.totals.timedSets).toBe(1);
    expect(dash.musclesPerWeek[0]?.groups).toEqual([{ muscle: "lats", sets: 1 }]);
  });

  it("coerces numeric strings from quirky payloads", () => {
    const quirky = set({
      type: "normal",
      weight_kg: "80" as unknown as number,
      reps: "5" as unknown as number,
    });
    expect(setVolumeKg(quirky, "strength", "weight_reps")).toBe(400);
    expect(setVolumeKg(quirky, "warmup", "weight_reps")).toBe(0);
  });
});

describe("1RM, streaks, and weeks", () => {
  it("estimates 1RM with Epley through 12 reps and keeps the heavier top set", () => {
    expect(estimated1RmKg(100, 10)).toBeCloseTo(100 * (1 + 10 / 30));
    expect(estimated1RmKg(100, 1)).toBe(100);
    expect(estimated1RmKg(100, 13)).toBeNull();
    expect(estimated1RmKg(0, 5)).toBeNull();

    const series = exercise("Bench Press (Barbell)", [
      set({ type: "warmup", weight_kg: 200, reps: 1 }),
      set({ index: 1, type: "normal", weight_kg: 100, reps: 10 }),
      set({ index: 2, type: "normal", weight_kg: 90, reps: 12 }),
      set({ index: 3, type: "normal", weight_kg: 40, reps: 15 }),
    ]);
    const dash = buildDashboard(snapshot([workout("w", "2026-10-19T15:00:00Z", [series])], [chest]), {
      timeZone: "UTC",
      now: NOW,
    });
    expect(dash.exercises[0]?.points[0]).toMatchObject({
      topWeightKg: 100,
      topReps: 10,
      estimated1RmKg: 100 * (1 + 10 / 30),
    });
  });

  it("counts a streak through today or yesterday and remembers the longest run", () => {
    expect(currentStreak(["2026-10-28", "2026-10-29", "2026-10-30"], "2026-10-30")).toBe(3);
    expect(currentStreak(["2026-10-29"], "2026-10-30")).toBe(1);
    expect(currentStreak(["2026-10-28"], "2026-10-30")).toBe(0);
    expect(currentStreak([], "2026-10-30")).toBe(0);
    expect(longestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05", "2026-10-06"], "2026-10-30")).toBe(3);
    expect(currentStreak(["2026-10-05", "2026-10-06"], "2026-10-06")).toBe(2);
  });

  it("buckets Monday weeks, fills gaps, and shifts with the timezone", () => {
    expect(mondayOf("2026-10-30")).toBe("2026-10-26");
    expect(mondayOf("2026-10-25")).toBe("2026-10-19");
    expect(mondayOf("2026-10-19")).toBe("2026-10-19");
    expect(calendarDate("2026-10-30T02:00:00Z", "America/Los_Angeles")).toBe("2026-10-29");
    expect(calendarDate("2026-10-30T02:00:00Z", "UTC")).toBe("2026-10-30");

    const dash = buildDashboard(
      snapshot([
        workout("a", "2026-10-05T15:00:00Z", [exercise("Bench Press (Barbell)", [set({ type: "normal", weight_kg: 50, reps: 5 })])]),
        workout("b", "2026-10-21T15:00:00Z", [exercise("Bench Press (Barbell)", [set({ type: "normal", weight_kg: 55, reps: 5 })])]),
      ], [chest]),
      { timeZone: "UTC", now: NOW },
    );
    expect(dash.workoutsPerWeek.map((week) => [week.weekStart, week.count])).toEqual([
      ["2026-10-05", 1],
      ["2026-10-12", 0],
      ["2026-10-19", 1],
      ["2026-10-26", 0],
    ]);
    expect(dash.volumePerWeek[1]?.volumeKg).toBe(0);
    expect(dash.durationPerWeek[0]?.totalMinutes).toBe(60);
    expect(dash.streak.current).toBe(0);
    expect(dash.thisWeekCount).toBe(0);
  });

  it("falls back to UTC when the timezone name is invalid", () => {
    const dash = buildDashboard(snapshot([]), { timeZone: "Not/AZone", now: NOW });
    expect(dash.timezone).toBe("UTC");
    expect(dash.warnings[0]).toMatch(/UTC/);
    expect(dash.empty).toBe(true);
    expect(dash.workoutsPerWeek).toEqual([]);
  });
});

describe("sample fixture", () => {
  it("matches the Block 1 sample and keeps warm-ups out of the weekly total", () => {
    const sample = sampleSnapshot();
    const dash = buildDashboard(sample, { timeZone: "UTC", now: NOW });
    expect(dash.empty).toBe(false);
    expect(dash.workoutsLoaded).toBe(11);
    expect(dash.streak).toMatchObject({ current: 11, longest: 11, lastWorkoutDate: "2026-10-29" });
    expect(dash.workoutsPerWeek).toEqual([
      { weekStart: "2026-10-19", count: 7 },
      { weekStart: "2026-10-26", count: 4 },
    ]);
    expect(dash.thisWeekCount).toBe(4);

    const push = sample.workouts.find((item) => item.id === "workout-2026-10-19");
    expect(push?.title).toBe("Push");
    const bench = push?.exercises.find((item) => item.title === "Bench Press (Smith)");
    const template = sample.exerciseTemplates.find((item) => item.id === bench?.exercise_template_id);
    expect(template).toBeDefined();
    const benchVolume = bench!.sets.reduce(
      (sum, item) => sum + setVolumeKg(item, classifySet(item, classifyExercise(bench!, template)), template!.type),
      0,
    );
    expect(benchVolume).toBe(1380);

    let classified = 0;
    let naive = 0;
    for (const item of sample.workouts) {
      for (const entry of item.exercises) {
        const entryTemplate = sample.exerciseTemplates.find((candidate) => candidate.id === entry.exercise_template_id);
        const kind = classifyExercise(entry, entryTemplate);
        for (const itemSet of entry.sets) {
          const weight = itemSet.weight_kg ?? 0;
          const reps = itemSet.reps ?? 0;
          if (weight > 0 && reps > 0) naive += weight * reps;
          classified += setVolumeKg(itemSet, classifySet(itemSet, kind), entryTemplate?.type ?? null);
        }
      }
    }
    expect(dash.totals.volumeKg).toBeCloseTo(classified, 5);
    expect(dash.totals.volumeKg).toBeLessThan(naive);
    expect(dash.totals.warmupSets).toBeGreaterThan(0);
    expect(dash.totals.plyoContacts).toBeGreaterThan(0);
    expect(dash.totals.holdSeconds).toBeGreaterThan(0);
    expect(dash.volumePerWeek[0]!.volumeKg).toBeGreaterThan(1380);

    const smith = dash.exercises.find((series) => series.title === "Bench Press (Smith)");
    expect(smith?.points).toHaveLength(2);
    expect(smith!.points[1]!.estimated1RmKg!).toBeGreaterThan(smith!.points[0]!.estimated1RmKg!);
    expect(dash.routines).toHaveLength(12);
  });
});
