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
      <header className="flex items-center justify-between mb-3 gap-3">
        <ProgressRing
          value={completionPct}
          size={48}
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

      {/* Title */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          12-Week Hybrid Conditioning
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">
          Dashboard
        </h1>
      </div>

      {/* Current phase */}
      {day && (
        <div className="card p-3 mb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Current phase
            </span>
            <span className="chip border bg-brand/15 text-brand border-brand/30">
              Week {coord.week} · Day {coord.dayOfWeek}
            </span>
          </div>
          <div className="display text-xl font-bold leading-tight">
            {phaseTitle(day.phase)}
          </div>
          <p className="text-xs text-ink-muted mt-1">{phaseDesc(day.phase)}</p>
        </div>
      )}

      {/* Next / today's workout */}
      {coord.isRestDay ? (
        <div className="card p-4 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            Today
          </div>
          <div className="display text-3xl font-bold mb-1">Rest day</div>
          <p className="text-xs text-ink-muted">
            Walk if you want, drink water, sleep early.
          </p>
        </div>
      ) : day ? (
        <div className="card p-3 mb-3">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted">
              Today&apos;s workout
            </span>
            <span className="text-[10px] text-ink-dim uppercase tracking-wider">
              {day.intensity}
            </span>
          </div>
          <div className="display text-2xl font-bold leading-tight">
            {day.title}
          </div>
          <div className="text-xs text-ink-muted mt-1">{day.focus}</div>

          <Link
            href={`/workout/${day.week}/${day.dayOfWeek}`}
            className="btn btn-primary w-full mt-3"
          >
            {completionPct > 0 ? "Continue workout" : "Start workout"}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : null}

      {/* This week */}
      {weekDays && weekDays.length > 0 && (
        <div className="card p-3 mb-3">
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

      {/* Stats placeholder */}
      <div className="grid grid-cols-2 gap-2">
        <StatTile
          label="Sessions logged"
          value={
            todaysLogs && todaysLogs.length > 0
              ? `${todaysLogs.filter((l) => (l.sets ?? []).some((s) => s.completed)).length}`
              : "0"
          }
          sub="today"
          icon={<Flame size={14} className="text-brand" />}
        />
        <StatTile
          label="Phase"
          value={`${day?.phase ?? 1} / 3`}
          sub={phaseShort(day?.phase ?? 1)}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-ink-muted">
          {label}
        </span>
      </div>
      <div className="display text-2xl font-bold leading-none">{value}</div>
      {sub && <div className="text-[10px] text-ink-dim mt-1">{sub}</div>}
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

function phaseTitle(phase: number): string {
  if (phase === 1) return "Reconditioning & Aerobic Rebuilding";
  if (phase === 2) return "Threshold & Work Capacity";
  return "Hybrid Performance Integration";
}

function phaseDesc(phase: number): string {
  if (phase === 1)
    return "Restore aerobic base, rebuild movement, low orthopedic stress.";
  if (phase === 2)
    return "Density tolerance, repeat-effort capacity, sustained threshold.";
  return "Sustained high output, athletic resilience, hybrid performance.";
}

function phaseShort(phase: number): string {
  if (phase === 1) return "Reconditioning";
  if (phase === 2) return "Threshold";
  return "Performance";
}
