import type { ExerciseTemplate, HevyExercise, HevySet, HevySnapshot, HevyWorkout } from "../hevy/types";

export type ExerciseKind = "warmup" | "strength" | "plyometric" | "timed";
export type SetCategory = "warmup" | "strength" | "plyometric" | "timed";

const WARMUP_TITLES = new Set(["bodyweight squat", "easy walk or bike"]);

const PLYO_TITLE = /\b(jump|jumps|jumping|pogo)\b/i;

const TIMED_TITLE =
  /\b(hold|stretch|cat-cow|cat cow|open book|hip switch|pigeon|frog|dorsiflexion|short foot|toe spreading|toe stretch|wrist|floss|dead hang|couch|mobility|wall sit)\b/i;

const TIMED_TYPES = new Set([
  "duration",
  "weight_duration",
  "distance_duration",
  "floors_duration",
  "steps_duration",
]);

const ASSISTED_TYPES = new Set(["bodyweight_assisted", "bodyweight_assisted_reps"]);

/** Fallback when an exercise template is missing. Keys are normalized titles from the plan. */
const TITLE_MUSCLE: Record<string, string> = {
  "bench press (smith)": "chest",
  "incline bench (db)": "chest",
  "incline bench (barbell)": "chest",
  "bench press (barbell)": "chest",
  "iso-lateral chest press (machine)": "chest",
  "pec deck": "chest",
  "weighted chest dip": "chest",
  "incline chest fly (db)": "chest",
  "seated ohp (db)": "shoulders",
  "overhead press (smith)": "shoulders",
  "single arm lateral raise (cable)": "shoulders",
  "lateral raise (cable)": "shoulders",
  "seated lateral raise": "shoulders",
  "reverse fly single arm (cable)": "shoulders",
  "rear delt reverse fly (cable)": "shoulders",
  "lat pulldown (cable)": "lats",
  "lat pulldown (machine)": "lats",
  "weighted pull up": "lats",
  "pull up": "lats",
  "chest supported t bar row": "upper_back",
  "seated cable row wide": "upper_back",
  "single arm cable row": "upper_back",
  "bent over row (smith)": "upper_back",
  "chest supported incline row (db)": "upper_back",
  "pendlay row": "upper_back",
  "shrug (cable)": "traps",
  "shrug (smith)": "traps",
  "single arm curl (cable)": "biceps",
  "hammer curl (cable)": "biceps",
  "spider curl (barbell)": "biceps",
  "seated incline hammer curl": "biceps",
  "concentration curl": "biceps",
  "preacher curl (db)": "biceps",
  "triceps pushdown": "triceps",
  "overhead triceps ext (cable)": "triceps",
  "single arm tricep ext (db)": "triceps",
  "skullcrusher (barbell)": "triceps",
  "jm press": "triceps",
  "hack squat": "quadriceps",
  "pause squat": "quadriceps",
  "leg extension": "quadriceps",
  "single leg extension": "quadriceps",
  "split squat (db)": "quadriceps",
  "reverse lunge (db)": "quadriceps",
  "bulgarian split squat": "quadriceps",
  "back extension": "lower_back",
  "romanian deadlift (barbell)": "hamstrings",
  "lying leg curl": "hamstrings",
  "seated leg curl": "hamstrings",
  "nordic curl": "hamstrings",
  "calf press": "calves",
  "standing calf raise": "calves",
  "seated calf raise": "calves",
  "single leg standing calf raise": "calves",
  "hip adduction": "adductors",
  "hip adduction (cable)": "adductors",
  "hip abduction": "abductors",
  "hip thrust": "glutes",
  "crunch (machine)": "abdominals",
  "cable crunch": "abdominals",
};

export type WeekVolume = {
  weekStart: string;
  volumeKg: number;
  workingSets: number;
  warmupSets: number;
};

export type WeekWorkouts = {
  weekStart: string;
  count: number;
};

export type WeekDuration = {
  weekStart: string;
  totalMinutes: number;
  averageMinutes: number;
  sessions: number;
  holdMinutes: number;
  plyoContacts: number;
  plyoSets: number;
};

export type MuscleWeek = {
  weekStart: string;
  groups: { muscle: string; sets: number }[];
};

export type ExercisePoint = {
  date: string;
  startTime: string;
  workoutTitle: string;
  topWeightKg: number | null;
  topReps: number | null;
  estimated1RmKg: number | null;
};

export type ExerciseSeries = {
  id: string;
  title: string;
  muscle: string;
  points: ExercisePoint[];
};

export type DashboardModel = {
  timezone: string;
  warnings: string[];
  empty: boolean;
  reportedWorkoutCount: number;
  workoutsLoaded: number;
  routines: { id: string; title: string; folderId: number | null; exerciseCount: number }[];
  templateCount: number;
  streak: { current: number; longest: number; lastWorkoutDate: string | null };
  thisWeekCount: number;
  workoutsPerWeek: WeekWorkouts[];
  volumePerWeek: WeekVolume[];
  durationPerWeek: WeekDuration[];
  musclesPerWeek: MuscleWeek[];
  muscleFocusWeek: string | null;
  exercises: ExerciseSeries[];
  totals: {
    volumeKg: number;
    strengthSets: number;
    warmupSets: number;
    plyoSets: number;
    timedSets: number;
    plyoContacts: number;
    holdSeconds: number;
    sessionMinutes: number;
  };
};

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function calendarDate(iso: string, timeZone: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
  } catch {
    return null;
  }
  const read = (type: string) => parts.find((part) => part.type === type)?.value;
  const year = read("year");
  const month = read("month");
  const day = read("day");
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

/** Monday of the calendar week containing dateKey, as YYYY-MM-DD. */
export function mondayOf(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay();
  const delta = weekday === 0 ? -6 : 1 - weekday;
  return addDays(dateKey, delta);
}

export function classifyExercise(exercise: HevyExercise, template?: ExerciseTemplate): ExerciseKind {
  const title = normalizeTitle(exercise.title || template?.title || "");
  if (WARMUP_TITLES.has(title)) return "warmup";
  if (PLYO_TITLE.test(title)) return "plyometric";
  const templateType = template?.type?.toLowerCase() ?? "";
  if (TIMED_TYPES.has(templateType)) return "timed";
  if (TIMED_TITLE.test(title)) return "timed";
  if (isDurationOnly(exercise)) return "timed";
  return "strength";
}

export function classifySet(set: HevySet, kind: ExerciseKind): SetCategory {
  const type = (set.type || "normal").toLowerCase();
  if (type === "warmup" || kind === "warmup") return "warmup";
  if (kind === "plyometric") return "plyometric";
  if (kind === "timed") return "timed";
  return "strength";
}

/** Working strength volume in kilogram-reps. Warm-ups, plyos, holds, and assisted sets contribute 0. */
export function setVolumeKg(set: HevySet, category: SetCategory, templateType: string | null): number {
  if (category !== "strength") return 0;
  if (templateType && ASSISTED_TYPES.has(templateType.toLowerCase())) return 0;
  const weight = finiteNumber(set.weight_kg);
  const reps = finiteNumber(set.reps);
  if (weight === null || reps === null || weight <= 0 || reps <= 0) return 0;
  return weight * reps;
}

/** Epley estimate. A single is the estimate. Sets above 12 reps stay on the top-set series instead. */
export function estimated1RmKg(weightKg: number, reps: number): number | null {
  if (!(weightKg > 0) || !(reps >= 1) || reps > 12) return null;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function currentStreak(dates: string[], today: string): number {
  const unique = [...new Set(dates.filter((date) => date <= today))].sort();
  if (unique.length === 0) return 0;
  const last = unique[unique.length - 1];
  if (last !== today && last !== addDays(today, -1)) return 0;
  let streak = 1;
  for (let index = unique.length - 1; index > 0; index -= 1) {
    if (unique[index - 1] === addDays(unique[index], -1)) streak += 1;
    else break;
  }
  return streak;
}

export function longestStreak(dates: string[], today: string): number {
  const unique = [...new Set(dates.filter((date) => date <= today))].sort();
  if (unique.length === 0) return 0;
  let longest = 1;
  let run = 1;
  for (let index = 1; index < unique.length; index += 1) {
    if (unique[index] === addDays(unique[index - 1], 1)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

function isDurationOnly(exercise: HevyExercise): boolean {
  let sawDuration = false;
  for (const set of exercise.sets) {
    if ((set.type || "").toLowerCase() === "warmup") continue;
    const reps = finiteNumber(set.reps);
    const weight = finiteNumber(set.weight_kg);
    const duration = finiteNumber(set.duration_seconds);
    if ((reps !== null && reps > 0) || (weight !== null && weight > 0)) return false;
    if (duration !== null && duration > 0) sawDuration = true;
  }
  return sawDuration;
}

function resolveMuscle(exercise: HevyExercise, template?: ExerciseTemplate): string {
  const fromTemplate = template?.primary_muscle_group?.trim();
  if (fromTemplate) return fromTemplate.toLowerCase();
  return TITLE_MUSCLE[normalizeTitle(exercise.title)] ?? "other";
}

function sessionMinutes(workout: HevyWorkout): number {
  const start = new Date(workout.start_time).getTime();
  const end = new Date(workout.end_time).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return (end - start) / 60_000;
}

function weeksBetween(start: string, end: string): string[] {
  const weeks: string[] = [];
  for (let cursor = start; cursor <= end && weeks.length < 104; cursor = addDays(cursor, 7)) {
    weeks.push(cursor);
  }
  return weeks;
}

function resolveTimeZone(timeZone: string): { timeZone: string; warning: string | null } {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return { timeZone, warning: null };
  } catch {
    return {
      timeZone: "UTC",
      warning: `Timezone "${timeZone}" is not recognized. Weeks and streaks use UTC.`,
    };
  }
}

export function buildDashboard(
  snapshot: HevySnapshot,
  options: { timeZone: string; now: Date },
): DashboardModel {
  const resolved = resolveTimeZone(options.timeZone || "UTC");
  const warnings: string[] = [];
  if (resolved.warning) warnings.push(resolved.warning);
  const timeZone = resolved.timeZone;
  const today = calendarDate(options.now.toISOString(), timeZone);
  if (!today) {
    throw new Error("Could not resolve today's date.");
  }

  const templates = new Map(snapshot.exerciseTemplates.map((template) => [template.id, template]));
  const workouts = [...snapshot.workouts].sort((a, b) => a.start_time.localeCompare(b.start_time));

  const volume = new Map<string, WeekVolume>();
  const workoutCounts = new Map<string, number>();
  const duration = new Map<string, { minutes: number; sessions: number; holdSeconds: number; plyoContacts: number; plyoSets: number }>();
  const muscles = new Map<string, Map<string, number>>();
  const exerciseAcc = new Map<string, ExerciseSeries & { points: ExercisePoint[] }>();
  const dates: string[] = [];

  const totals = {
    volumeKg: 0,
    strengthSets: 0,
    warmupSets: 0,
    plyoSets: 0,
    timedSets: 0,
    plyoContacts: 0,
    holdSeconds: 0,
    sessionMinutes: 0,
  };

  const ensureWeek = (weekStart: string) => {
    if (!volume.has(weekStart)) {
      volume.set(weekStart, { weekStart, volumeKg: 0, workingSets: 0, warmupSets: 0 });
    }
    if (!duration.has(weekStart)) {
      duration.set(weekStart, { minutes: 0, sessions: 0, holdSeconds: 0, plyoContacts: 0, plyoSets: 0 });
    }
    if (!muscles.has(weekStart)) muscles.set(weekStart, new Map());
    if (!workoutCounts.has(weekStart)) workoutCounts.set(weekStart, 0);
  };

  for (const workout of workouts) {
    const date = calendarDate(workout.start_time, timeZone);
    if (!date) {
      warnings.push(`Skipped a workout with an unreadable start time (${workout.id}).`);
      continue;
    }
    dates.push(date);
    const weekStart = mondayOf(date);
    ensureWeek(weekStart);
    workoutCounts.set(weekStart, (workoutCounts.get(weekStart) ?? 0) + 1);
    const minutes = sessionMinutes(workout);
    const durationWeek = duration.get(weekStart)!;
    durationWeek.minutes += minutes;
    durationWeek.sessions += 1;
    totals.sessionMinutes += minutes;

    for (const exercise of workout.exercises ?? []) {
      const template = templates.get(exercise.exercise_template_id);
      const kind = classifyExercise(exercise, template);
      const muscle = resolveMuscle(exercise, template);
      const templateType = template?.type ?? null;
      let point = exerciseAcc.get(exerciseKey(exercise));
      if (!point && kind === "strength") {
        point = {
          id: exercise.exercise_template_id || normalizeTitle(exercise.title),
          title: exercise.title || template?.title || "Exercise",
          muscle,
          points: [],
        };
        exerciseAcc.set(exerciseKey(exercise), point);
      }

      let topWeight: number | null = null;
      let topReps: number | null = null;
      let best1Rm: number | null = null;

      for (const set of exercise.sets ?? []) {
        const category = classifySet(set, kind);
        if (category === "warmup") {
          totals.warmupSets += 1;
          volume.get(weekStart)!.warmupSets += 1;
          continue;
        }
        if (category === "plyometric") {
          totals.plyoSets += 1;
          const reps = finiteNumber(set.reps) ?? 0;
          totals.plyoContacts += Math.max(0, reps);
          durationWeek.plyoSets += 1;
          durationWeek.plyoContacts += Math.max(0, reps);
          continue;
        }
        if (category === "timed") {
          totals.timedSets += 1;
          const seconds = finiteNumber(set.duration_seconds) ?? 0;
          if (seconds > 0) {
            totals.holdSeconds += seconds;
            durationWeek.holdSeconds += seconds;
          }
          continue;
        }

        totals.strengthSets += 1;
        const vol = setVolumeKg(set, category, templateType);
        totals.volumeKg += vol;
        const weekVolume = volume.get(weekStart)!;
        weekVolume.volumeKg += vol;
        weekVolume.workingSets += 1;
        const muscleCounts = muscles.get(weekStart)!;
        muscleCounts.set(muscle, (muscleCounts.get(muscle) ?? 0) + 1);

        const weight = finiteNumber(set.weight_kg);
        const reps = finiteNumber(set.reps);
        if (weight !== null && weight > 0 && reps !== null && reps > 0) {
          if (topWeight === null || weight > topWeight || (weight === topWeight && reps > (topReps ?? 0))) {
            topWeight = weight;
            topReps = reps;
          }
          const estimate = estimated1RmKg(weight, reps);
          if (estimate !== null && (best1Rm === null || estimate > best1Rm)) best1Rm = estimate;
        }
      }

      if (point && topWeight !== null && topReps !== null) {
        point.points.push({
          date,
          startTime: workout.start_time,
          workoutTitle: workout.title,
          topWeightKg: topWeight,
          topReps,
          estimated1RmKg: best1Rm,
        });
      }
    }
  }

  const sortedWeeks = [...workoutCounts.keys()].sort();
  let weekKeys: string[] = [];
  if (sortedWeeks.length > 0) {
    let end = sortedWeeks[sortedWeeks.length - 1];
    const currentWeek = mondayOf(today);
    if (currentWeek > end) {
      const throughToday = weeksBetween(end, currentWeek);
      if (throughToday.length <= 9) end = currentWeek;
    }
    weekKeys = weeksBetween(sortedWeeks[0], end);
    for (const week of weekKeys) ensureWeek(week);
  }

  const exercises = [...exerciseAcc.values()]
    .map((series) => ({
      ...series,
      points: series.points.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
    .filter((series) => series.points.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));

  const thisWeek = mondayOf(today);

  return {
    timezone: timeZone,
    warnings,
    empty: workouts.length === 0,
    reportedWorkoutCount: snapshot.workoutCount,
    workoutsLoaded: workouts.length,
    routines: snapshot.routines.map((routine) => ({
      id: routine.id,
      title: routine.title,
      folderId: routine.folder_id,
      exerciseCount: routine.exercises.length,
    })),
    templateCount: snapshot.exerciseTemplates.length,
    streak: {
      current: currentStreak(dates, today),
      longest: longestStreak(dates, today),
      lastWorkoutDate: latestOnOrBefore(dates, today),
    },
    thisWeekCount: workoutCounts.get(thisWeek) ?? 0,
    workoutsPerWeek: weekKeys.map((weekStart) => ({
      weekStart,
      count: workoutCounts.get(weekStart) ?? 0,
    })),
    volumePerWeek: weekKeys.map((weekStart) => volume.get(weekStart)!),
    durationPerWeek: weekKeys.map((weekStart) => {
      const row = duration.get(weekStart)!;
      return {
        weekStart,
        totalMinutes: row.minutes,
        averageMinutes: row.sessions ? row.minutes / row.sessions : 0,
        sessions: row.sessions,
        holdMinutes: row.holdSeconds / 60,
        plyoContacts: row.plyoContacts,
        plyoSets: row.plyoSets,
      };
    }),
    musclesPerWeek: weekKeys.map((weekStart) => ({
      weekStart,
      groups: [...(muscles.get(weekStart)?.entries() ?? [])]
        .map(([muscle, sets]) => ({ muscle, sets }))
        .sort((a, b) => b.sets - a.sets || a.muscle.localeCompare(b.muscle)),
    })),
    muscleFocusWeek: [...weekKeys].reverse().find((week) => (muscles.get(week)?.size ?? 0) > 0) ?? null,
    exercises,
    totals,
  };
}

function exerciseKey(exercise: HevyExercise): string {
  return exercise.exercise_template_id || `title:${normalizeTitle(exercise.title)}`;
}

function latestOnOrBefore(dates: string[], today: string): string | null {
  const sorted = [...new Set(dates)].sort();
  return [...sorted].reverse().find((date) => date <= today) ?? sorted.at(-1) ?? null;
}
