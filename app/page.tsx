"use client";

import Link from "next/link";
import { Settings as SettingsIcon, ArrowRight, Flame } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { BrandBanner, LogoCompact } from "@/components/Logo";
import { ProgressRing } from "@/components/ProgressRing";
import { StartDateSetup } from "@/components/StartDateSetup";
import { computeCoord, DAY_NAMES } from "@/lib/programDate";
import { cx } from "@/lib/utils";

type Day = Doc<"programDays">;
type Log = Doc<"exerciseLogs">;

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

  const completionPct = (() => {
    if (!day || !todaysLogs) return 0;
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
    return total ? done / total : 0;
  })();

  return (
    <div className="px-3 pt-1 pb-4">
      {/* Brand banner */}
      <BrandBanner className="mb-1" />

      {/* Controls row */}
      <header className="flex items-center justify-between mb-2 gap-3">
        <ProgressRing
          value={completionPct}
          size={44}
          stroke={5}
          label={`${Math.round(completionPct * 100)}%`}
          sub="today"
        />
        <Link
          href="/settings"
          className="h-9 w-9 rounded-lg flex items-center justify-center bg-bg-elev tap"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </Link>
      </header>

      {/* Today's workout (phase info folded in) */}
      {coord.isRestDay ? (
        <div className="card p-2.5 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Today
            </span>
            <span className="chip border bg-brand/15 text-brand border-brand/30">
              Week {coord.week}
            </span>
          </div>
          <div className="display text-2xl font-bold leading-tight mt-1">
            Rest day
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Walk, hydrate, sleep early.
          </p>
        </div>
      ) : day ? (
        <div className="card p-2.5 mb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Today&apos;s workout
            </span>
            <span className="chip border bg-brand/15 text-brand border-brand/30">
              W{coord.week} · D{coord.dayOfWeek} · {day.intensity}
            </span>
          </div>
          <div className="display text-2xl font-bold leading-tight mt-1">
            {day.title}
          </div>
          <div className="text-xs text-ink-muted">{day.focus}</div>
          <div className="text-[10px] text-ink-dim mt-0.5">
            {phaseShort(day.phase)}
          </div>

          <Link
            href={`/workout/${day.week}/${day.dayOfWeek}`}
            className="btn btn-primary w-full mt-2"
          >
            {completionPct > 0 ? "Continue workout" : "Start workout"}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : null}

      {/* This week */}
      {weekDays && weekDays.length > 0 && (
        <div className="card p-2.5 mb-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
            This week
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
                      "text-[9px] uppercase tracking-wider",
                      isToday ? "text-brand" : "text-ink-muted",
                    )}
                  >
                    {DAY_NAMES[d.dayOfWeek - 1].slice(0, 3)}
                  </div>
                  <div
                    className={cx(
                      "display text-sm font-bold mt-0.5",
                      isToday ? "text-brand" : "text-ink",
                    )}
                  >
                    {d.intensity.split("–")[0].replace("%", "")}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact stats row */}
      <div className="flex items-center justify-between gap-2 mt-2 px-1 text-[11px] text-ink-muted">
        <div className="flex items-center gap-1.5">
          <Flame size={12} className="text-brand" />
          <span className="tabular">
            {todaysLogs && todaysLogs.length > 0
              ? `${todaysLogs.filter((l) => (l.sets ?? []).some((s) => s.completed)).length}`
              : "0"}{" "}
            logged today
          </span>
        </div>
        <span>
          Phase {day?.phase ?? 1}/3 ·{" "}
          <span className="text-ink">{phaseShort(day?.phase ?? 1)}</span>
        </span>
      </div>
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
  if (phase === 1) return "Reconditioning";
  if (phase === 2) return "Threshold";
  return "Performance";
}
