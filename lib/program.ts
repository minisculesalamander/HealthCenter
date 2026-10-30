/** Weekly order from docs/workout-plan.md. Thursday and Sunday both use Recovery. */
export const PROGRAM_WEEK = [
  { day: "Monday", short: "Mon", routine: "Push" },
  { day: "Tuesday", short: "Tue", routine: "Pull" },
  { day: "Wednesday", short: "Wed", routine: "Legs" },
  { day: "Thursday", short: "Thu", routine: "Recovery" },
  { day: "Friday", short: "Fri", routine: "Upper" },
  { day: "Saturday", short: "Sat", routine: "Lower" },
  { day: "Sunday", short: "Sun", routine: "Recovery" },
] as const;

export const ROUTINE_TITLES = ["Push", "Pull", "Legs", "Recovery", "Upper", "Lower"] as const;
