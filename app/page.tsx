"use client";

import Link from "next/link";
import { Settings as SettingsIcon, ArrowRight, Play } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { LogoCompact } from "@/components/Logo";
import { ProgressRing } from "@/components/ProgressRing";
import { ReadinessCard } from "@/components/ReadinessCard";
import { StartDateSetup } from "@/components/StartDateSetup";
import { computeCoord, DAY_NAMES } from "@/lib/programDate";
import { cx } from "@/lib/utils";

type Day = Doc<"programDays">;
type Log = Doc<"exerciseLogs">;

const SECTION_PILLS = ["Warm-up", "Main", "Conditioning", "Cooldown"];

export default function HomePage() {
  const settings = useQuery(api.settings.get);
  const coord = computeCoord(settings?.programStartDate ?? undefined);
  const day = useQuery(
    api.programDays.getDay,
    settings === undefined
      ? "skip"
      : { week: coord.week, dayOfWeek: coord.dayOfWeek },
  ) as Day | null | undefined;
  const todaysLogs = useQuery(api.exerciseLogs.listForDate, {
    date: coord.dateISO,
  }) as Log[] | undefined;
  const weekDays = useQuery(
    api.programDays.listWeek,
    settings === undefined ? "skip" : { week: coord.week },
  ) as Day[] | undefined;

  if (settings === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LogoCompact size="md" className="opacity-50" />
      </div>
    );
  }

  if (!settings?.programStartDate) return <StartDateSetup />;

  // Today's done vs total sets across all sections.
  const { doneSets, totalSets, completionPct } = (() => {
    if (!day || !todaysLogs) return { doneSets: 0, totalSets: 0, completionPct: 0 };
    let total = 0;
    let done = 0;
    for (const sec of [day.warmup, day.mainBlock, day.conditioningBlock, day.cooldown]) {
      for (const ex of sec.exercises) {
        const log = todaysLogs.find((l) => l.exerciseId === ex.id);
        const expected = log?.sets?.length ?? prescribedSetCount(ex.prescription, ex.trackingType);
        total += expected;
        if (log) done += (log.sets ?? []).filter((s) => s.completed).length;
      }
    }
    return {
      doneSets: done,
      totalSets: total,
      completionPct: total ? done / total : 0,
    };
  })();

  // Count completed daily logs this week.
  const weekDoneCount = (() => {
    if (!weekDays) return 0;
    // We could query dailyLogs for the week, but for now this is just based on
    // whether today's logged set count > 0. Leave precise count for later.
    return doneSets > 0 ? 1 : 0;
  })();

  return (
    <div className="px-3 pt-3 pb-4">
      {/* Header — T+wordmark left, ring + settings right */}
      <header className="flex items-start justify-between gap-3 mb-3">
        <LogoCompact size="hero" />
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <ProgressRing
            value={completionPct}
            size={64}
            stroke={6}
            label={`${Math.round(completionPct * 100)}%`}
            sub={`${doneSets}/${totalSets}`}
          />
          <Link
            href="/settings"
            className="h-9 w-9 rounded-lg flex items-center justify-center bg-bg-elev tap"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </Link>
        </div>
      </header>

      {/* Title block */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          12-Week Hybrid Conditioning
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">
          Dashboard
        </h1>
      </div>

      {/* Current Phase */}
      {day && (
        <div className="card p-3 mb-2">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Current phase
            </span>
            <Link
              href="/program"
              className="text-[12px] text-brand font-semibold tap inline-flex items-center gap-0.5"
            >
              Program <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="chip border bg-brand/15 text-brand border-brand/30">
              {phaseShort(day.phase).toUpperCase()}
            </span>
            <span className="text-sm text-ink font-semibold">
              Week {coord.week} / 12
            </span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            {phaseDesc(day.phase)}
          </p>
        </div>
      )}

      {/* Next workout */}
      {coord.isRestDay ? (
        <div className="card p-3 mb-2">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Today
            </span>
          </div>
          <div className="display text-2xl font-bold leading-tight mb-1">
            Rest day
          </div>
          <p className="text-xs text-ink-muted">
            Walk, hydrate, sleep early.
          </p>
        </div>
      ) : day ? (
        <div className="card p-3 mb-2">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Next workout
            </span>
            <span className="text-[10px] text-ink-dim uppercase tracking-wider">
              W{coord.week} · D{coord.dayOfWeek}
            </span>
          </div>
          <div className="display text-2xl font-bold leading-tight mb-2">
            {day.title.toUpperCase()}
          </div>

          {/* Section pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[11px] text-ink-muted">
            {SECTION_PILLS.map((p, i) => (
              <span key={p} className="flex items-center gap-1.5">
                <span>{p}</span>
                {i < SECTION_PILLS.length - 1 && (
                  <span className="text-ink-dim">·</span>
                )}
              </span>
            ))}
          </div>

          <Link
            href={`/workout/${day.week}/${day.dayOfWeek}`}
            className="btn btn-primary w-full"
          >
            <Play size={16} className="fill-current" />
            {completionPct > 0 ? "Continue workout" : "Start workout"}
          </Link>
        </div>
      ) : null}

      {/* Readiness */}
      <ReadinessCard />

      {/* This week */}
      {weekDays && weekDays.length > 0 && (
        <div className="card p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              This week
            </span>
            <span className="text-[10px] uppercase tracking-wider text-ink-dim">
              {weekDoneCount}/{weekDays.length} done
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {weekDays.map((d) => {
              const isToday =
                d.week === coord.week && d.dayOfWeek === coord.dayOfWeek;
              return (
                <Link
                  key={d._id}
                  href={`/workout/${d.week}/${d.dayOfWeek}`}
                  className={cx(
                    "rounded-lg border p-2 text-center tap transition-colors",
                    isToday
                      ? "border-brand bg-brand/10"
                      : "border-bg-line bg-bg-elev/40 hover:bg-bg-elev",
                  )}
                >
                  <div
                    className={cx(
                      "text-[9px] uppercase tracking-wider mb-0.5",
                      isToday ? "text-brand" : "text-ink-muted",
                    )}
                  >
                    {DAY_NAMES[d.dayOfWeek - 1].slice(0, 3)}
                  </div>
                  <div
                    className={cx(
                      "text-[11px] font-semibold leading-tight truncate",
                      isToday ? "text-brand" : "text-ink",
                    )}
                    title={d.focus}
                  >
                    {shortFocus(d.focus)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function prescribedSetCount(prescription: string, trackingType: string): number {
  if (trackingType === "check") return 1;
  const m =
    prescription.match(/(\d+)\s*[×x]/i) ??
    prescription.match(/^\s*(\d+)\s+rounds/i);
  if (m) return Math.max(1, Math.min(10, parseInt(m[1], 10)));
  return 1;
}

function phaseShort(phase: number): string {
  if (phase === 1) return "Base";
  if (phase === 2) return "Threshold";
  return "Performance";
}

function phaseDesc(phase: number): string {
  if (phase === 1)
    return "Restore aerobic base, rebuild movement, low orthopedic stress.";
  if (phase === 2)
    return "Density tolerance, repeat-effort capacity, sustained threshold.";
  return "Sustained high output, athletic resilience, hybrid performance.";
}

function shortFocus(focus: string): string {
  // Take the first word, e.g. "Aerobic Strength Integration" → "Aerobic"
  return focus.split(/\s+/)[0];
}
