import { EXERCISE_TEMPLATES, plannedRoutines } from "./catalog";
import { sampleWorkouts } from "./sample";
import type { HevySnapshot } from "./types";

export function emptySnapshot(): HevySnapshot {
  return {
    workoutCount: 0,
    workouts: [],
    routines: plannedRoutines(),
    exerciseTemplates: EXERCISE_TEMPLATES,
  };
}

export function sampleSnapshot(): HevySnapshot {
  const workouts = sampleWorkouts();
  return {
    workoutCount: workouts.length,
    workouts,
    routines: plannedRoutines(),
    exerciseTemplates: EXERCISE_TEMPLATES,
  };
}
