# HealthCenter

Personal training dashboard for the [8-week Hevy plan](docs/workout-plan.md). It reads workouts, routines, and exercise templates from the [Hevy public API](https://api.hevyapp.com/docs) and turns them into weekly stats.

The Hevy API key stays on the server. The browser never receives it.

## Panels

- Workouts per week, plus the current and longest day streak
- Working-set volume per week (kilogram × reps, shown in pounds)
- Per-exercise progress: Epley estimated 1RM for sets of 1–12 reps, otherwise the top set
- Primary muscle-group set counts per week
- Session time, with hold/stretch minutes and plyometric contacts kept beside it

Warm-up sets (`type: "warmup"`), plyometrics (jumps and pogos), and timed work (holds, stretches, mobility) are excluded from volume and from muscle-set counts. Bodyweight squat and the easy walk/bike are treated as warm-ups. Assisted-bodyweight load is excluded from volume.

Strava (runs and rides) and body-weight trends are marked placeholders for a later version.

With zero logged workouts the page shows an empty state instead of empty charts.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Purpose |
| --- | --- |
| `HEVY_API_KEY` | Hevy Pro key from [hevy.com/settings?developer](https://hevy.com/settings?developer). When this is set, the app calls `https://api.hevyapp.com`. Leave it unset to use fixtures. |
| `HEVY_FIXTURE` | `empty` (default, 0 workouts) or `sample` (Block 1 sessions from 19–29 Oct 2026). Ignored when `HEVY_API_KEY` is set. |
| `HEVY_TIMEZONE` | IANA timezone for weeks and streaks. Defaults to `UTC`. |

Preview the charts without a key:

```bash
HEVY_FIXTURE=sample npm run dev
```

Do not commit a real key. `.env.local` is gitignored. The key is read only in `lib/hevy/server.ts` (`import "server-only"`) and sent as the `api-key` header.

Endpoints used: `GET /v1/workouts` (paginated, 10 per page), `GET /v1/workouts/count`, `GET /v1/exercise_templates`, `GET /v1/routines`.

## Test

```bash
npm test
npm run typecheck
```

Stats tests cover volume exclusions, estimated 1RM, streaks, week buckets, and the sample fixture. Loader tests cover pagination, the `api-key` header, and that UI source does not mention the key.
