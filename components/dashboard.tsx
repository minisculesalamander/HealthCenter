import { formatDay, formatMinutes, formatPounds, formatTopSet, kgToLb, muscleLabel } from "../lib/format";
import { PROGRAM_WEEK } from "../lib/program";
import type { DashboardModel, ExerciseSeries } from "../lib/stats/compute";
import { HorizontalBars, TrendChart, VerticalBars } from "./charts";
import { Placeholders } from "./placeholders";

export type DashboardView = DashboardModel & {
  source: "live" | "fixture";
  fixtureName: "empty" | "sample" | null;
};

const PREFERRED_ROUTINES = ["Push", "Pull", "Legs", "Recovery", "Upper", "Lower"];

function sourceLabel(data: DashboardView): string {
  if (data.source === "live") return "Live Hevy";
  return data.fixtureName === "sample" ? "Sample fixture" : "Empty fixture";
}

function routineLine(data: DashboardView): string {
  const counts = new Map<string, number>();
  for (const routine of data.routines) {
    counts.set(routine.title, (counts.get(routine.title) ?? 0) + 1);
  }
  const titles = [...counts.keys()].sort((a, b) => {
    const ai = PREFERRED_ROUTINES.indexOf(a);
    const bi = PREFERRED_ROUTINES.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  if (titles.length === 0) {
    return data.source === "live"
      ? "Hevy returned no routines."
      : "No routines are in this fixture.";
  }
  const doubled = [...counts.values()].every((count) => count === 2);
  const listed = titles.join(", ");
  const suffix = doubled ? " Each title is stored twice, once per block." : "";
  if (data.source === "fixture" && data.fixtureName === "empty") {
    return `Routine titles from the training plan: ${listed}.${suffix}`;
  }
  return `Routines on the account: ${listed}.${suffix}`;
}

function selectExercise(exercises: ExerciseSeries[], requested?: string): ExerciseSeries | null {
  if (exercises.length === 0) return null;
  const match = exercises.find((exercise) => exercise.id === requested);
  if (match) return match;
  return (
    exercises.find((exercise) => exercise.title === "Bench Press (Smith)") ??
    exercises.find((exercise) => exercise.points.length > 1) ??
    exercises[0]
  );
}

export function Dashboard({ data, selectedExercise }: { data: DashboardView; selectedExercise?: string }) {
  const exercise = selectExercise(data.exercises, selectedExercise);
  const usesEstimate = exercise?.points.some((point) => point.estimated1RmKg !== null) ?? false;
  const focus = data.musclesPerWeek.find((week) => week.weekStart === data.muscleFocusWeek);

  return (
    <main className="page" data-state={data.empty ? "empty" : "ready"} data-source={data.source}>
      <header className="mast">
        <div>
          <p className="kicker">Personal training log</p>
          <h1>HealthCenter</h1>
          <p className="lede">
            Eight weeks in two blocks. The week is Push, Pull, Legs, Recovery, Upper, Lower, Recovery.
          </p>
        </div>
        <div className="status">
          <span className={`pill pill-${data.source}`}>{sourceLabel(data)}</span>
          <p className="meta">
            {data.reportedWorkoutCount} reported
            {data.workoutsLoaded === data.reportedWorkoutCount ? "" : ` · ${data.workoutsLoaded} loaded`} · {data.timezone}
          </p>
        </div>
      </header>

      <ol className="rhythm" aria-label="Weekly training order">
        {PROGRAM_WEEK.map((day) => (
          <li key={day.day}>
            <span>{day.short}</span>
            <strong>{day.routine}</strong>
          </li>
        ))}
      </ol>

      {data.warnings.length > 0 ? (
        <ul className="warnings">
          {data.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {data.empty ? (
        <section className="empty" data-testid="empty-state">
          <p className="kicker">Hevy</p>
          <p className="empty-count">0</p>
          <h2>No workouts logged yet</h2>
          <p>
            The workout count is 0, so streak, volume, exercise progress, muscle counts, and time stay empty.
            Log the first session in Hevy and these panels fill in.
          </p>
          <ul className="waiting">
            <li>Workouts per week and the current streak</li>
            <li>Working-set volume per week</li>
            <li>Per-exercise estimated 1RM or top set</li>
            <li>Muscle group set counts per week</li>
            <li>Session time, with holds and plyometrics kept separate</li>
          </ul>
          <p className="quiet">{routineLine(data)}</p>
        </section>
      ) : (
        <div className="grid">
          <section className="card" aria-labelledby="streak-heading" data-testid="streak">
            <h2 id="streak-heading">Streak</h2>
            <p className="stat-value">{data.streak.current}</p>
            <p className="stat-caption">
              {data.streak.current === 1 ? "day" : "days"} in a row
              {data.streak.lastWorkoutDate ? ` · last ${formatDay(data.streak.lastWorkoutDate)}` : ""}
            </p>
            <dl className="facts">
              <div>
                <dt>Longest</dt>
                <dd>{data.streak.longest} days</dd>
              </div>
              <div>
                <dt>This week</dt>
                <dd>{data.thisWeekCount} workouts</dd>
              </div>
            </dl>
            <p className="quiet">A day counts once a workout is logged. The run stays intact through yesterday.</p>
          </section>

          <section className="card" aria-labelledby="weeks-heading" data-testid="workouts-per-week">
            <h2 id="weeks-heading">Workouts per week</h2>
            <VerticalBars
              ariaLabel="Workouts per week"
              points={data.workoutsPerWeek.map((week) => ({
                label: formatDay(week.weekStart),
                value: week.count,
                display: String(week.count),
              }))}
            />
            <WeekTable
              headers={["Week of", "Workouts"]}
              rows={data.workoutsPerWeek.map((week) => [formatDay(week.weekStart), String(week.count)])}
            />
          </section>

          <section className="card" aria-labelledby="volume-heading" data-testid="volume">
            <h2 id="volume-heading">Volume per week</h2>
            <p className="stat-value">{formatPounds(data.totals.volumeKg)}</p>
            <p className="stat-caption">Working strength volume, converted from kilograms</p>
            <VerticalBars
              ariaLabel="Working volume per week in pounds"
              points={data.volumePerWeek.map((week) => ({
                label: formatDay(week.weekStart),
                value: week.volumeKg,
                display: formatPounds(week.volumeKg),
              }))}
            />
            <p className="quiet">
              {data.totals.strengthSets} working sets in the total. Beside that: {data.totals.warmupSets} warm-up sets,{" "}
              {data.totals.plyoSets} plyometric sets ({data.totals.plyoContacts} contacts), and {data.totals.timedSets}{" "}
              hold or stretch sets ({formatMinutes(data.totals.holdSeconds / 60)}).
            </p>
            <WeekTable
              headers={["Week of", "Volume", "Working sets", "Warm-up sets"]}
              rows={data.volumePerWeek.map((week) => [
                formatDay(week.weekStart),
                formatPounds(week.volumeKg),
                String(week.workingSets),
                String(week.warmupSets),
              ])}
            />
          </section>

          <section className="card" aria-labelledby="time-heading" data-testid="duration">
            <h2 id="time-heading">Time</h2>
            <p className="stat-value">{formatMinutes(data.totals.sessionMinutes)}</p>
            <p className="stat-caption">Session clock from start to finish</p>
            <VerticalBars
              ariaLabel="Session minutes per week"
              points={data.durationPerWeek.map((week) => ({
                label: formatDay(week.weekStart),
                value: week.totalMinutes,
                display: formatMinutes(week.totalMinutes),
              }))}
            />
            <WeekTable
              headers={["Week of", "Session time", "Average", "Holds", "Plyo contacts"]}
              rows={data.durationPerWeek.map((week) => [
                formatDay(week.weekStart),
                formatMinutes(week.totalMinutes),
                formatMinutes(week.averageMinutes),
                formatMinutes(week.holdMinutes),
                String(week.plyoContacts),
              ])}
            />
          </section>

          <section className="card span-2" aria-labelledby="muscle-heading" data-testid="muscles">
            <h2 id="muscle-heading">Muscle group sets</h2>
            <p className="quiet">
              Working strength sets by primary muscle
              {focus ? ` · week of ${formatDay(focus.weekStart)}` : ""}. Warm-ups, plyometrics, and holds stay out of this count.
            </p>
            {focus && focus.groups.length > 0 ? (
              <HorizontalBars
                ariaLabel={`Working sets by muscle for the week of ${formatDay(focus.weekStart)}`}
                rows={focus.groups.map((group) => ({
                  label: muscleLabel(group.muscle),
                  value: group.sets,
                  display: String(group.sets),
                }))}
              />
            ) : (
              <p className="quiet">No working strength sets in this range.</p>
            )}
            {data.musclesPerWeek.length > 1 ? (
              <WeekTable
                headers={["Week of", "Sets by muscle"]}
                rows={data.musclesPerWeek.map((week) => [
                  formatDay(week.weekStart),
                  week.groups.length
                    ? week.groups.map((group) => `${muscleLabel(group.muscle)} ${group.sets}`).join(" · ")
                    : "—",
                ])}
              />
            ) : null}
          </section>

          <section className="card span-2" aria-labelledby="progress-heading" data-testid="progress">
            <div className="section-kicker">
              <h2 id="progress-heading">Exercise progress</h2>
              {data.exercises.length > 0 ? (
                <form action="/" method="get" className="exercise-form">
                  <label htmlFor="exercise">Exercise</label>
                  <select id="exercise" name="exercise" defaultValue={exercise?.id} key={exercise?.id}>
                    {data.exercises.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} · {muscleLabel(item.muscle)}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Show</button>
                </form>
              ) : null}
            </div>
            {exercise ? (
              <>
                <p className="quiet">
                  {usesEstimate
                    ? "Estimated 1RM uses Epley on working sets of 1–12 reps. Heavier warm-up sets are ignored. Higher-rep sets stay in the top-set column."
                    : "Top-set weight. Reps are above the range used for an estimated 1RM."}
                </p>
                <TrendChart
                  ariaLabel={`${exercise.title} ${usesEstimate ? "estimated 1RM" : "top set"} over time`}
                  points={exercise.points.map((point) => ({
                    label: formatDay(point.date),
                    value: usesEstimate
                      ? point.estimated1RmKg === null
                        ? null
                        : kgToLb(point.estimated1RmKg)
                      : point.topWeightKg === null
                        ? null
                        : kgToLb(point.topWeightKg),
                  }))}
                />
                <WeekTable
                  headers={["Date", "Workout", "Top set", "Est. 1RM"]}
                  rows={exercise.points.map((point) => [
                    formatDay(point.date),
                    point.workoutTitle,
                    formatTopSet(point.topWeightKg, point.topReps),
                    point.estimated1RmKg === null ? "—" : formatPounds(point.estimated1RmKg, 0),
                  ])}
                />
              </>
            ) : (
              <p className="quiet">No weighted working sets yet. Holds, stretches, and plyometrics stay on the time panel.</p>
            )}
          </section>
        </div>
      )}

      <div className={data.empty ? "grid" : undefined}>
        {data.empty ? null : <p className="quiet routine-line span-2">{routineLine(data)}</p>}
        <Placeholders />
      </div>

      <footer className="colophon">
        <p>
          Volume is weight × reps on working strength sets. Hevy stores kilograms; pounds are the display unit. Warm-up
          sets, plyometrics, and timed holds or stretches are totaled on their own.
        </p>
      </footer>
    </main>
  );
}

function WeekTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="plain">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("|")}>
            {row.map((cell, index) => (
              <td key={index}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DashboardError({ message }: { message: string }) {
  return (
    <main className="page" data-state="error">
      <header className="mast">
        <div>
          <p className="kicker">Personal training log</p>
          <h1>HealthCenter</h1>
        </div>
      </header>
      <section className="empty" role="alert">
        <h2>Hevy could not be loaded</h2>
        <p>{message}</p>
      </section>
      <div className="grid">
        <Placeholders />
      </div>
    </main>
  );
}
