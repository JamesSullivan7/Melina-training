# Tulsa Training — Hybrid Conditioning Tracker

12-week functional hybrid conditioning + athletic reconstruction tracker.
Mobile-first. Day-level logging, not set-by-set noise.

## Pass 1 scope

What's in this build:

- **Today** (`/`) — your assigned workout for today, with warm-up, main block,
  conditioning, and cooldown sections. Anchor weeks (1, 5, 9) carry the full
  prescription; weeks 2–4, 6–8, 10–12 show the anchor's content with a
  "Week N Adjustments" banner listing the progression deltas.
- **Log** (`/log`) — sub-60-second daily log: RPE, energy before/after, sleep,
  soreness, cardio rating, warm-up/cooldown checkboxes, notes, and optional
  bodyweight / waist / resting HR.
- **Program** (`/program`) — full 12-week overview by phase and week.
- **Setup screen** — pick your start Monday on first launch. The app computes
  today's week/day from that.
- **Rest day card** — weekends show "Rest Day" plus a peek at the next session.

What's intentionally **not** here yet (deferred to Passes 2/3):

- Dashboard / analytics / charts
- Recovery readiness scoring (green/yellow/red)
- Trend graphs (RPE, sleep, soreness, bodyweight, waist)
- Program calendar grid view
- PWA install / offline support
- Export

## First-time setup

```bash
# from C:\Users\james\code\tulsa-training-app
npm install            # already done if you cloned fresh
npx convex dev         # ← authenticate to Convex (browser opens once)
```

`npx convex dev` does three things on first run:

1. Asks you to log into Convex in the browser (one-time).
2. Creates a dev deployment for this app.
3. Writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.
4. Generates `convex/_generated/*` (overwriting the stubs that shipped with this repo).

Leave `npx convex dev` running — it watches your `convex/` folder and pushes changes
to your deployment.

In a second terminal:

```bash
npm run dev
```

Open <http://localhost:3000>. You should see the welcome / "BEGIN PROGRAM" screen.

## Seeding the program

Once Convex is connected, seed the 12 weeks of program data:

```bash
npx convex run programDays:seed
```

This is idempotent — running it again wipes and re-seeds.
Edit `convex/programData.ts` to change content; re-run the seed.

## Resetting the program

If you want to pick a new start date:

```bash
# Wipes settings only — your daily logs survive.
npx convex run settings:get  # see current value first
# Then either edit via the Convex dashboard, or:
npx convex run settings:setStartDate '{"programStartDate":"2026-06-01"}'
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Convex: `npx convex deploy` — creates a production deployment, prints the prod URL.
3. In Vercel: import the GitHub repo. Add env vars:
   - `NEXT_PUBLIC_CONVEX_URL` = the prod Convex URL from step 2
   - `CONVEX_DEPLOY_KEY` = from the Convex dashboard
4. Set the build command to `npx convex deploy --cmd 'next build'` (this redeploys
   your Convex functions on every Vercel deploy too).

## Project layout

```
app/                  # Next.js App Router pages
  page.tsx            # Today's workout
  log/page.tsx        # Daily log form
  program/page.tsx    # 12-week overview
  layout.tsx          # Root layout, fonts, providers
  globals.css         # Tulsa Training design tokens
components/
  TulsaT.tsx          # The brand mark — never redrawn, never SVG-approximated
  BottomNav.tsx
  WorkoutView.tsx
  RestDayCard.tsx
  StartDateSetup.tsx
convex/
  schema.ts           # programDays, dailyLogs, settings
  programData.ts      # 12-week program content (source of truth)
  programDays.ts      # queries + seed
  dailyLogs.ts        # upsert + read
  settings.ts         # programStartDate
lib/
  programDate.ts      # week/day computation from a start Monday
public/
  tulsa-t-mark.png    # red T — sacred, untouched
  tulsa-training-wordmark.png
```

## Design rules baked in

- **The red T is sacred.** Loaded as PNG. Modify only via CSS (filter, scale,
  position). Never redraw, never SVG-approximate.
- **No per-set logging.** Daily logs are day-level. RPE, energy, sleep,
  soreness. Less than 60 seconds to fill out.
- **Anchor + adjustments.** Weeks 1, 5, 9 carry full prescriptions. Other
  weeks reference an anchor and apply a textual delta. No fabricated volumes.
- **Mobile first.** Bottom nav, big touch targets, single-column layouts.
  Desktop works but is not the priority.
