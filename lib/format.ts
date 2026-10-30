const POUNDS_PER_KG = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * POUNDS_PER_KG;
}

export function formatPounds(kg: number, digits = 0): string {
  return `${kgToLb(kg).toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })} lb`;
}

export function formatTopSet(weightKg: number | null, reps: number | null): string {
  if (weightKg === null || reps === null) return "—";
  const pounds = kgToLb(weightKg);
  const shown = pounds >= 20 ? Math.round(pounds) : Math.round(pounds * 10) / 10;
  const repsShown = Number.isInteger(reps) ? String(reps) : reps.toFixed(1);
  return `${shown.toLocaleString("en-US")} lb × ${repsShown}`;
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours <= 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatDay(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

const MUSCLE_LABELS: Record<string, string> = {
  abdominals: "Abdominals",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  quadriceps: "Quadriceps",
  hamstrings: "Hamstrings",
  calves: "Calves",
  glutes: "Glutes",
  abductors: "Abductors",
  adductors: "Adductors",
  lats: "Lats",
  upper_back: "Upper back",
  traps: "Traps",
  lower_back: "Lower back",
  chest: "Chest",
  cardio: "Cardio",
  neck: "Neck",
  full_body: "Full body",
  other: "Other",
};

export function muscleLabel(muscle: string): string {
  return MUSCLE_LABELS[muscle] ?? muscle.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
