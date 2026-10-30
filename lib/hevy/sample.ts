import { requireTemplate, routineIdFor } from "./catalog";
import type { HevyExercise, HevySet, HevyWorkout } from "./types";

type SetSpec =
  | { kind: "wu"; w: number; r: number }
  | { kind: "work"; w: number; r: number; step: "db" | "bar" }
  | { kind: "plyo"; r: number; sets: number }
  | { kind: "hold"; s: number; sets: number }
  | { kind: "bw"; r: number; sets: number }
  | { kind: "walk"; s: number };

type ExSpec = { title: string; sets: SetSpec[] };

const wu = (w: number, r: number): SetSpec => ({ kind: "wu", w, r });
const work = (w: number, r: number, step: "db" | "bar" = "bar"): SetSpec => ({
  kind: "work",
  w,
  r,
  step,
});
const plyo = (sets: number, r: number): SetSpec => ({ kind: "plyo", r, sets });
const hold = (sets: number, s: number): SetSpec => ({ kind: "hold", s, sets });
const bw = (sets: number, r: number): SetSpec => ({ kind: "bw", r, sets });

function pushDay(): ExSpec[] {
  return [
    { title: "Cat-Cow", sets: [hold(1, 45)] },
    { title: "Bench Press (Smith)", sets: [wu(40, 8), wu(50, 5), work(60, 8), work(60, 8), work(60, 7)] },
    { title: "Incline Bench (DB)", sets: [wu(22, 8), work(30, 10, "db"), work(30, 9, "db")] },
    { title: "Seated OHP (DB)", sets: [wu(14, 8), work(18, 10, "db"), work(18, 8, "db")] },
    { title: "Single Arm Lateral Raise (Cable)", sets: [work(10, 12, "db"), work(10, 12, "db")] },
    { title: "Triceps Pushdown", sets: [work(25, 12, "db"), work(25, 11, "db")] },
    { title: "Overhead Triceps Ext (Cable)", sets: [work(12, 12, "db"), work(12, 10, "db")] },
  ];
}

function pullDay(): ExSpec[] {
  return [
    { title: "Cat-Cow", sets: [hold(1, 45)] },
    { title: "Lat Pulldown (Cable)", sets: [wu(30, 10), wu(40, 8), work(50, 10), work(50, 10), work(50, 8)] },
    { title: "Chest Supported T Bar Row", sets: [wu(30, 8), work(45, 10), work(45, 8), work(45, 8)] },
    { title: "Seated Cable Row Wide", sets: [work(40, 12, "db"), work(40, 12, "db")] },
    { title: "Reverse Fly Single Arm (Cable)", sets: [work(8, 15, "db"), work(8, 15, "db")] },
    { title: "Shrug (Cable)", sets: [work(30, 15, "db"), work(30, 12, "db")] },
    { title: "Single Arm Curl (Cable)", sets: [work(12, 12, "db"), work(12, 10, "db")] },
    { title: "Hammer Curl (Cable)", sets: [work(12, 12, "db"), work(12, 12, "db")] },
  ];
}

function legsDay(): ExSpec[] {
  return [
    { title: "Bodyweight squat", sets: [bw(2, 10)] },
    { title: "Jump Squat", sets: [plyo(3, 5)] },
    { title: "Pogo Jumps", sets: [plyo(2, 10)] },
    { title: "Hack Squat", sets: [wu(40, 8), wu(60, 5), work(80, 8), work(80, 8), work(80, 6)] },
    { title: "Back Extension", sets: [wu(20, 10), work(40, 10), work(40, 10)] },
    { title: "Lying Leg Curl", sets: [work(35, 12), work(35, 10)] },
    { title: "Leg Extension", sets: [work(40, 12), work(40, 12)] },
    { title: "Calf Press", sets: [work(50, 12), work(50, 12)] },
    { title: "Wall Sit", sets: [hold(2, 45)] },
    { title: "Single Leg Calf Raise Iso Hold", sets: [hold(2, 30)] },
  ];
}

function upperDay(): ExSpec[] {
  return [
    { title: "Cat-Cow", sets: [hold(1, 45)] },
    { title: "Incline Bench (DB)", sets: [wu(20, 8), wu(24, 6), work(28, 10, "db"), work(28, 10, "db"), work(28, 8, "db")] },
    { title: "Lat Pulldown (Machine)", sets: [wu(35, 8), work(48, 10), work(48, 10), work(48, 9)] },
    { title: "Pec Deck", sets: [work(40, 12), work(40, 12)] },
    { title: "Bent Over Row (Smith)", sets: [work(40, 10), work(40, 8)] },
    { title: "Single Arm Lateral Raise (Cable)", sets: [work(10, 12, "db"), work(10, 12, "db")] },
    { title: "Skullcrusher (Barbell)", sets: [work(30, 10), work(30, 8)] },
    { title: "Concentration Curl", sets: [work(12, 12, "db"), work(12, 10, "db")] },
  ];
}

function lowerDay(): ExSpec[] {
  return [
    { title: "Bodyweight squat", sets: [bw(2, 10)] },
    { title: "Box Jump", sets: [plyo(3, 4)] },
    { title: "Split Squat (DB)", sets: [wu(16, 8), work(22, 10, "db"), work(22, 8, "db"), work(22, 8, "db")] },
    { title: "Seated Leg Curl", sets: [work(32, 12), work(32, 12)] },
    { title: "Reverse Lunge (DB)", sets: [work(18, 10, "db"), work(18, 8, "db")] },
    { title: "Hip Adduction", sets: [work(40, 15), work(40, 15)] },
    { title: "Hip Abduction", sets: [work(40, 15), work(40, 15)] },
    { title: "Standing Calf Raise", sets: [work(40, 12), work(40, 12)] },
    { title: "Crunch (Machine)", sets: [work(30, 12), work(30, 12)] },
    { title: "Spanish Squat Iso Hold", sets: [hold(2, 45)] },
    { title: "Split Squat Iso Hold", sets: [hold(2, 30)] },
  ];
}

function recoveryDay(): ExSpec[] {
  return [
    { title: "Easy walk or bike", sets: [{ kind: "walk", s: 300 }] },
    { title: "Cat-Cow", sets: [hold(1, 45)] },
    { title: "Thoracic Open Book", sets: [hold(1, 40)] },
    { title: "90/90 Hip Switch", sets: [hold(1, 40)] },
    { title: "Half-Kneeling Hip Flexor Stretch", sets: [hold(2, 45)] },
    { title: "Pigeon", sets: [hold(2, 45)] },
    { title: "Frog", sets: [hold(1, 45)] },
    { title: "Knee-to-Wall Ankle Dorsiflexion", sets: [hold(2, 40)] },
    { title: "Wall Calf Stretch", sets: [hold(2, 45)] },
    { title: "Short Foot/Toe Spreading", sets: [hold(1, 30)] },
    { title: "Kneeling Toe Stretch", sets: [hold(1, 40)] },
    { title: "Quadruped Wrist Rocks", sets: [hold(1, 30)] },
    { title: "Wrist Flexor and Extensor Stretch", sets: [hold(1, 40)] },
  ];
}

const DAYS: Record<string, () => ExSpec[]> = {
  Push: pushDay,
  Pull: pullDay,
  Legs: legsDay,
  Upper: upperDay,
  Lower: lowerDay,
  Recovery: recoveryDay,
};

const SESSION_MINUTES: Record<string, number> = {
  Push: 68,
  Pull: 72,
  Legs: 80,
  Upper: 66,
  Lower: 76,
  Recovery: 36,
};

function blankSet(
  index: number,
  type: string,
  weight: number | null,
  reps: number | null,
  duration: number | null,
): HevySet {
  return {
    index,
    type,
    weight_kg: weight,
    reps,
    distance_meters: null,
    duration_seconds: duration,
    rpe: null,
    custom_metric: null,
  };
}

function expandSpecs(specs: SetSpec[], week: 0 | 1): HevySet[] {
  const sets: HevySet[] = [];
  for (const spec of specs) {
    if (spec.kind === "wu") {
      sets.push(blankSet(sets.length, "warmup", spec.w, spec.r, null));
    } else if (spec.kind === "work") {
      const bump = week === 1 ? (spec.step === "db" ? 1 : 2.5) : 0;
      sets.push(blankSet(sets.length, "normal", spec.w + bump, spec.r, null));
    } else if (spec.kind === "plyo") {
      for (let i = 0; i < spec.sets; i += 1) {
        sets.push(blankSet(sets.length, "normal", null, spec.r, null));
      }
    } else if (spec.kind === "hold") {
      for (let i = 0; i < spec.sets; i += 1) {
        sets.push(blankSet(sets.length, "normal", null, null, spec.s));
      }
    } else if (spec.kind === "bw") {
      for (let i = 0; i < spec.sets; i += 1) {
        sets.push(blankSet(sets.length, "warmup", null, spec.r, null));
      }
    } else {
      sets.push(blankSet(sets.length, "warmup", null, null, spec.s));
    }
  }
  return sets;
}

function exercisesFor(day: string, week: 0 | 1): HevyExercise[] {
  return DAYS[day]().map((spec, index) => {
    const template = requireTemplate(spec.title);
    return {
      index,
      title: spec.title,
      notes: null,
      exercise_template_id: template.id,
      superset_id: null,
      sets: expandSpecs(spec.sets, week),
    };
  });
}

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString().replace(".000Z", "Z");
}

/**
 * Block 1 logged as if the account trained Mon 19 Oct through Thu 29 Oct 2026.
 * Week two working loads step up; warm-ups stay light.
 */
export function sampleWorkouts(): HevyWorkout[] {
  const workouts: HevyWorkout[] = [];
  for (let day = 19; day <= 29; day += 1) {
    const date = `2026-10-${String(day).padStart(2, "0")}`;
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const title = ["Recovery", "Push", "Pull", "Legs", "Recovery", "Upper", "Lower"][weekday];
    const week: 0 | 1 = date >= "2026-10-26" ? 1 : 0;
    const start = `${date}T15:00:00Z`;
    const end = addMinutes(start, SESSION_MINUTES[title]);
    workouts.push({
      id: `workout-${date}`,
      title,
      routine_id: routineIdFor(title, 1),
      description: week === 0 ? "Block 1, week 1" : "Block 1, week 2",
      start_time: start,
      end_time: end,
      updated_at: end,
      created_at: start,
      exercises: exercisesFor(title, week),
    });
  }
  return workouts;
}
