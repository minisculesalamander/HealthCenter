import type { ExerciseTemplate, Routine, RoutineExercise, RoutineSet } from "./types";

type Seed = {
  title: string;
  type: string;
  muscle: string;
  equipment: string;
  custom?: boolean;
  secondary?: string[];
};

const lift = (
  title: string,
  muscle: string,
  equipment: string,
  secondary: string[] = [],
): Seed => ({
  title,
  type: "weight_reps",
  muscle,
  equipment,
  secondary,
});

const plyo = (title: string): Seed => ({
  title,
  type: "bodyweight_reps",
  muscle: "full_body",
  equipment: "none",
  custom: true,
});

const timed = (title: string, muscle: string): Seed => ({
  title,
  type: "duration",
  muscle,
  equipment: "none",
  custom: true,
});

/** Exercise templates for both blocks of docs/workout-plan.md. */
export const TEMPLATE_SEEDS: Seed[] = [
  timed("Cat-Cow", "full_body"),
  lift("Bench Press (Smith)", "chest", "machine", ["shoulders", "triceps"]),
  lift("Incline Bench (DB)", "chest", "dumbbell", ["shoulders", "triceps"]),
  lift("Seated OHP (DB)", "shoulders", "dumbbell", ["triceps"]),
  lift("Single Arm Lateral Raise (Cable)", "shoulders", "other"),
  lift("Triceps Pushdown", "triceps", "other"),
  lift("Overhead Triceps Ext (Cable)", "triceps", "other"),
  lift("Lat Pulldown (Cable)", "lats", "other", ["biceps", "upper_back"]),
  lift("Chest Supported T Bar Row", "upper_back", "machine", ["lats", "biceps"]),
  lift("Seated Cable Row Wide", "upper_back", "other", ["lats"]),
  lift("Reverse Fly Single Arm (Cable)", "shoulders", "other"),
  lift("Shrug (Cable)", "traps", "other"),
  lift("Single Arm Curl (Cable)", "biceps", "other"),
  lift("Hammer Curl (Cable)", "biceps", "other"),
  {
    title: "Bodyweight squat",
    type: "bodyweight_reps",
    muscle: "quadriceps",
    equipment: "none",
    custom: true,
  },
  plyo("Jump Squat"),
  plyo("Pogo Jumps"),
  lift("Hack Squat", "quadriceps", "machine", ["glutes"]),
  lift("Back Extension", "lower_back", "machine", ["glutes", "hamstrings"]),
  lift("Lying Leg Curl", "hamstrings", "machine"),
  lift("Leg Extension", "quadriceps", "machine"),
  lift("Calf Press", "calves", "machine"),
  timed("Wall Sit", "quadriceps"),
  timed("Single Leg Calf Raise Iso Hold", "calves"),
  lift("Lat Pulldown (Machine)", "lats", "machine", ["biceps"]),
  lift("Pec Deck", "chest", "machine"),
  lift("Bent Over Row (Smith)", "upper_back", "machine", ["lats"]),
  lift("Skullcrusher (Barbell)", "triceps", "barbell"),
  lift("Concentration Curl", "biceps", "dumbbell"),
  plyo("Box Jump"),
  lift("Split Squat (DB)", "quadriceps", "dumbbell", ["glutes"]),
  lift("Seated Leg Curl", "hamstrings", "machine"),
  lift("Reverse Lunge (DB)", "quadriceps", "dumbbell", ["glutes"]),
  lift("Hip Adduction", "adductors", "machine"),
  lift("Hip Abduction", "abductors", "machine"),
  lift("Standing Calf Raise", "calves", "machine"),
  lift("Crunch (Machine)", "abdominals", "machine"),
  timed("Spanish Squat Iso Hold", "quadriceps"),
  timed("Split Squat Iso Hold", "quadriceps"),
  timed("Easy walk or bike", "cardio"),
  timed("Thoracic Open Book", "full_body"),
  timed("90/90 Hip Switch", "glutes"),
  timed("Half-Kneeling Hip Flexor Stretch", "other"),
  timed("Pigeon", "glutes"),
  timed("Frog", "adductors"),
  timed("Knee-to-Wall Ankle Dorsiflexion", "calves"),
  timed("Wall Calf Stretch", "calves"),
  timed("Short Foot/Toe Spreading", "other"),
  timed("Kneeling Toe Stretch", "other"),
  timed("Quadruped Wrist Rocks", "forearms"),
  timed("Wrist Flexor and Extensor Stretch", "forearms"),
  lift("Incline Bench (Barbell)", "chest", "barbell", ["shoulders", "triceps"]),
  lift("Iso-Lateral Chest Press (Machine)", "chest", "machine", ["triceps"]),
  lift("Overhead Press (Smith)", "shoulders", "machine", ["triceps"]),
  lift("Lateral Raise (Cable)", "shoulders", "other"),
  lift("Weighted Chest Dip", "chest", "other", ["triceps", "shoulders"]),
  lift("Single Arm Tricep Ext (DB)", "triceps", "dumbbell"),
  lift("Weighted Pull Up", "lats", "other", ["biceps"]),
  lift("Pendlay Row", "upper_back", "barbell", ["lats"]),
  lift("Single Arm Cable Row", "upper_back", "other", ["lats"]),
  lift("Rear Delt Reverse Fly (Cable)", "shoulders", "other"),
  lift("Shrug (Smith)", "traps", "machine"),
  lift("Spider Curl (Barbell)", "biceps", "barbell"),
  lift("Seated Incline Hammer Curl", "biceps", "dumbbell"),
  plyo("Lateral Box Jump"),
  plyo("Jumping Lunge"),
  lift("Pause Squat", "quadriceps", "barbell", ["glutes"]),
  lift("Romanian Deadlift (Barbell)", "hamstrings", "barbell", ["glutes", "lower_back"]),
  lift("Nordic Curl", "hamstrings", "none"),
  lift("Single Leg Extension", "quadriceps", "machine"),
  lift("Seated Calf Raise", "calves", "machine"),
  lift("Bench Press (Barbell)", "chest", "barbell", ["shoulders", "triceps"]),
  lift("Pull Up", "lats", "other", ["biceps"]),
  lift("Incline Chest Fly (DB)", "chest", "dumbbell"),
  lift("Chest Supported Incline Row (DB)", "upper_back", "dumbbell", ["lats"]),
  lift("Seated Lateral Raise", "shoulders", "dumbbell"),
  lift("JM Press", "triceps", "barbell"),
  lift("Preacher Curl (DB)", "biceps", "dumbbell"),
  plyo("Frog Jumps"),
  lift("Bulgarian Split Squat", "quadriceps", "dumbbell", ["glutes"]),
  lift("Hip Thrust", "glutes", "barbell", ["hamstrings"]),
  lift("Hip Adduction (Cable)", "adductors", "other"),
  lift("Single Leg Standing Calf Raise", "calves", "machine"),
  lift("Tibialis Raise", "other", "other"),
  lift("Cable Crunch", "abdominals", "other"),
  timed("Deep Squat Hold", "quadriceps"),
  timed("Couch Stretch", "other"),
  timed("Hamstring Floss", "hamstrings"),
  timed("Dead Hang", "forearms"),
];

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = TEMPLATE_SEEDS.map((seed, index) => ({
  id: `C${(index + 1).toString(16).toUpperCase().padStart(7, "0")}`,
  title: seed.title,
  type: seed.type,
  primary_muscle_group: seed.muscle,
  secondary_muscle_groups: seed.secondary ?? [],
  equipment_category: seed.equipment,
  is_custom: seed.custom ?? false,
}));

const templateByTitle = new Map(EXERCISE_TEMPLATES.map((template) => [template.title, template]));

export function requireTemplate(title: string): ExerciseTemplate {
  const template = templateByTitle.get(title);
  if (!template) {
    throw new Error(`Missing exercise template for "${title}"`);
  }
  return template;
}

const RECOVERY_BLOCK_1 = [
  "Easy walk or bike",
  "Cat-Cow",
  "Thoracic Open Book",
  "90/90 Hip Switch",
  "Half-Kneeling Hip Flexor Stretch",
  "Pigeon",
  "Frog",
  "Knee-to-Wall Ankle Dorsiflexion",
  "Wall Calf Stretch",
  "Short Foot/Toe Spreading",
  "Kneeling Toe Stretch",
  "Quadruped Wrist Rocks",
  "Wrist Flexor and Extensor Stretch",
];

const ROUTINE_EXERCISES: Record<string, string[]> = {
  "1:Push": [
    "Cat-Cow",
    "Bench Press (Smith)",
    "Incline Bench (DB)",
    "Seated OHP (DB)",
    "Single Arm Lateral Raise (Cable)",
    "Triceps Pushdown",
    "Overhead Triceps Ext (Cable)",
  ],
  "1:Pull": [
    "Cat-Cow",
    "Lat Pulldown (Cable)",
    "Chest Supported T Bar Row",
    "Seated Cable Row Wide",
    "Reverse Fly Single Arm (Cable)",
    "Shrug (Cable)",
    "Single Arm Curl (Cable)",
    "Hammer Curl (Cable)",
  ],
  "1:Legs": [
    "Bodyweight squat",
    "Jump Squat",
    "Pogo Jumps",
    "Hack Squat",
    "Back Extension",
    "Lying Leg Curl",
    "Leg Extension",
    "Calf Press",
    "Wall Sit",
    "Single Leg Calf Raise Iso Hold",
  ],
  "1:Upper": [
    "Cat-Cow",
    "Incline Bench (DB)",
    "Lat Pulldown (Machine)",
    "Pec Deck",
    "Bent Over Row (Smith)",
    "Single Arm Lateral Raise (Cable)",
    "Skullcrusher (Barbell)",
    "Concentration Curl",
  ],
  "1:Lower": [
    "Bodyweight squat",
    "Box Jump",
    "Split Squat (DB)",
    "Seated Leg Curl",
    "Reverse Lunge (DB)",
    "Hip Adduction",
    "Hip Abduction",
    "Standing Calf Raise",
    "Crunch (Machine)",
    "Spanish Squat Iso Hold",
    "Split Squat Iso Hold",
  ],
  "1:Recovery": RECOVERY_BLOCK_1,
  "2:Push": [
    "Incline Bench (Barbell)",
    "Iso-Lateral Chest Press (Machine)",
    "Overhead Press (Smith)",
    "Lateral Raise (Cable)",
    "Weighted Chest Dip",
    "Single Arm Tricep Ext (DB)",
  ],
  "2:Pull": [
    "Weighted Pull Up",
    "Pendlay Row",
    "Single Arm Cable Row",
    "Rear Delt Reverse Fly (Cable)",
    "Shrug (Smith)",
    "Spider Curl (Barbell)",
    "Seated Incline Hammer Curl",
  ],
  "2:Legs": [
    "Bodyweight squat",
    "Lateral Box Jump",
    "Jumping Lunge",
    "Pause Squat",
    "Romanian Deadlift (Barbell)",
    "Nordic Curl",
    "Single Leg Extension",
    "Seated Calf Raise",
    "Wall Sit",
    "Single Leg Calf Raise Iso Hold",
  ],
  "2:Upper": [
    "Bench Press (Barbell)",
    "Pull Up",
    "Incline Chest Fly (DB)",
    "Chest Supported Incline Row (DB)",
    "Seated Lateral Raise",
    "JM Press",
    "Preacher Curl (DB)",
  ],
  "2:Lower": [
    "Bodyweight squat",
    "Pogo Jumps",
    "Frog Jumps",
    "Bulgarian Split Squat",
    "Hip Thrust",
    "Lying Leg Curl",
    "Hack Squat",
    "Hip Adduction (Cable)",
    "Single Leg Standing Calf Raise",
    "Tibialis Raise",
    "Cable Crunch",
    "Spanish Squat Iso Hold",
    "Split Squat Iso Hold",
  ],
  "2:Recovery": [
    ...RECOVERY_BLOCK_1,
    "Deep Squat Hold",
    "Couch Stretch",
    "Hamstring Floss",
    "Dead Hang",
  ],
};

function routineSet(template: ExerciseTemplate, index: number): RoutineSet {
  const timedSet = template.type === "duration";
  return {
    index,
    type: template.title === "Bodyweight squat" || template.title === "Easy walk or bike" ? "warmup" : "normal",
    weight_kg: null,
    reps: timedSet ? null : 8,
    rep_range: timedSet ? null : { start: 8, end: 10 },
    distance_meters: null,
    duration_seconds: timedSet ? 45 : null,
    rpe: null,
    custom_metric: null,
  };
}

function routineExercise(title: string, index: number): RoutineExercise {
  const template = requireTemplate(title);
  return {
    index,
    title,
    rest_seconds: template.type === "duration" ? 0 : 90,
    notes: null,
    exercise_template_id: template.id,
    superset_id: null,
    sets: [routineSet(template, 0)],
  };
}

const DAY_TITLES = ["Push", "Pull", "Legs", "Recovery", "Upper", "Lower"] as const;
const STAMP = "2026-10-01T15:00:00Z";

/** Twelve routines: six day titles in each block folder. */
export function plannedRoutines(): Routine[] {
  const routines: Routine[] = [];
  for (const block of [1, 2] as const) {
    for (const title of DAY_TITLES) {
      const titles = ROUTINE_EXERCISES[`${block}:${title}`];
      routines.push({
        id: `routine-b${block}-${title.toLowerCase()}`,
        title,
        folder_id: block,
        updated_at: STAMP,
        created_at: STAMP,
        exercises: titles.map(routineExercise),
      });
    }
  }
  return routines;
}

export function routineIdFor(title: string, block: 1 | 2 = 1): string {
  return `routine-b${block}-${title.toLowerCase()}`;
}
