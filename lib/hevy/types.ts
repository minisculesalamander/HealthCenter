/** Shapes follow the Hevy public API (https://api.hevyapp.com/docs). */

export type HevySet = {
  index: number;
  type: string;
  weight_kg: number | null;
  reps: number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  custom_metric: number | null;
};

export type HevyExercise = {
  index: number;
  title: string;
  notes: string | null;
  exercise_template_id: string;
  superset_id: number | null;
  sets: HevySet[];
};

export type HevyWorkout = {
  id: string;
  title: string;
  routine_id: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  updated_at: string;
  created_at: string;
  exercises: HevyExercise[];
};

export type WorkoutsPage = {
  page: number;
  page_count: number;
  workouts: HevyWorkout[];
};

export type WorkoutCountResponse = {
  workout_count?: number;
  count?: number;
};

export type ExerciseTemplate = {
  id: string;
  title: string;
  type: string;
  primary_muscle_group: string;
  secondary_muscle_groups: string[];
  equipment_category: string | null;
  is_custom: boolean;
};

export type ExerciseTemplatesPage = {
  page: number;
  page_count: number;
  exercise_templates: ExerciseTemplate[];
};

export type RoutineSet = {
  index: number;
  type: string;
  weight_kg: number | null;
  reps: number | null;
  rep_range: { start: number | null; end: number | null } | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  custom_metric: number | null;
};

export type RoutineExercise = {
  index: number;
  title: string;
  rest_seconds: number | null;
  notes: string | null;
  exercise_template_id: string;
  superset_id: number | null;
  sets: RoutineSet[];
};

export type Routine = {
  id: string;
  title: string;
  folder_id: number | null;
  updated_at: string;
  created_at: string;
  exercises: RoutineExercise[];
};

export type RoutinesPage = {
  page: number;
  page_count: number;
  routines: Routine[];
};

export type HevySnapshot = {
  workoutCount: number;
  workouts: HevyWorkout[];
  routines: Routine[];
  exerciseTemplates: ExerciseTemplate[];
};
