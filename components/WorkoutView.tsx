"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Heart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { Exercise, Section as ProgramSection } from "@/convex/types";
import { TTMark } from "./Logo";
import { ExerciseCard } from "./ExerciseCard";
import { cx } from "@/lib/utils";

type Day = Doc<"programDays">;
type Log = Doc<"exerciseLogs">;

const SECTION_KEYS = ["warmup", "mainBlock", "conditioningBlock", "cooldown"] as const;
const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  warmup: "Warm-up",
  mainBlock: "Main",
  conditioningBlock: "Conditioning",
  cooldown: "Cooldown",
};

export function WorkoutView({
  day,
  dateISO,
  showBack = false,
}: {
  day: Day;
  dateISO: string;
  showBack?: boolean;
}) {
  const todaysLogs = useQuery(api.exerciseLogs.listForDate, {
    date: dateISO,
  }) as Log[] | undefined;
  const lastByExercise = useQuery(api.exerciseLogs.lastByExercise) as
    | Log[]
    | undefined;

  const logByExId = useMemo(() => {
    const m = new Map<string, Log>();
    if (todaysLogs) for (const l of todaysLogs) m.set(l.exerciseId, l);
    return m;
  }, [todaysLogs]);

  const prevByExId = useMemo(() => {
    const m = new Map<string, Log>();
    if (lastByExercise) {
      for (const l of lastByExercise) {
        // Exclude today's log so "prev" is genuinely prior.
        if (l.date !== dateISO) m.set(l.exerciseId, l);
      }
    }
    return m;
  }, [lastByExercise, dateISO]);

  // Compute overall completion %.
  const { overallPct, totalSets } = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const key of SECTION_KEYS) {
      const sec = day[key] as ProgramSection;
      for (const ex of sec.exercises) {
        const log = logByExId.get(ex.id);
        // Count expected sets from prescription, capped at logged set count
        const expected =
          log?.sets?.length ??
          prescribedSetCount(ex.prescription, ex.trackingType);
        total += expected;
        if (log) done += (log.sets ?? []).filter((s) => s.completed).length;
      }
    }
    return { overallPct: total ? done / total : 0, totalSets: total };
  }, [day, logByExId]);

  return (
    <div className="px-3 pt-3 pb-4">
      {/* Header */}
      <header className="flex items-center gap-2 mb-3">
        {showBack && (
          <Link
            href="/program"
            className="h-9 w-9 rounded-lg flex items-center justify-center bg-bg-elev tap"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <TTMark size={26} className="opacity-95" />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Week {day.week} · Day {day.dayOfWeek}
          </span>
          <h1 className="display text-2xl font-bold leading-tight">
            {day.title}
          </h1>
        </div>
        <div className="display text-base font-bold tabular-nums shrink-0">
          {Math.round(overallPct * 100)}%
        </div>
      </header>

      {/* Phase / focus / intensity strip */}
      <div className="card px-3 py-2 mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">
            {phaseLabel(day.phase)}
          </div>
          <div className="text-sm text-ink truncate">{day.focus}</div>
        </div>
        <div className="chip border bg-brand/15 text-brand border-brand/30 shrink-0">
          {day.intensity}
        </div>
      </div>

      {/* Adjustments banner for non-anchor weeks */}
      {!day.isAnchor && day.adjustments && day.adjustments.length > 0 && (
        <div className="card border-l-4 px-3 py-2 mb-3" style={{ borderLeftColor: "#D93B58" }}>
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-brand font-semibold">
              Week {day.week} Adjustments
            </div>
            <div className="text-[9px] text-ink-dim uppercase tracking-wider">
              base: week {day.anchorWeek}
            </div>
          </div>
          <ul className="space-y-1">
            {day.adjustments.map((a, i) => (
              <li key={i} className="text-[12px] text-ink leading-snug flex gap-2">
                <span className="text-brand">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coaching notes */}
      {day.coachingNotes && day.coachingNotes.length > 0 && (
        <div className="card px-3 py-2 mb-3">
          <div className="flex items-start gap-2">
            <Heart size={14} className="text-brand mt-0.5 shrink-0" />
            <div className="space-y-1">
              {day.coachingNotes.map((n, i) => (
                <p key={i} className="text-[12px] text-ink leading-snug">
                  {n}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-5">
        {SECTION_KEYS.map((key) => {
          const sec = day[key] as ProgramSection;
          return (
            <SectionBlock
              key={key}
              label={SECTION_LABELS[key]}
              section={sec}
              date={dateISO}
              week={day.week}
              dayOfWeek={day.dayOfWeek}
              logByExId={logByExId}
              prevByExId={prevByExId}
            />
          );
        })}
      </div>

      {/* Bottom action */}
      <div className="mt-6 flex gap-2 pb-2">
        <button
          className={cx(
            "btn flex-1",
            overallPct >= 1 ? "btn-primary" : "btn-outline",
          )}
        >
          <CheckCircle2 size={16} />
          {overallPct >= 1 ? "Complete workout" : "Save & finish"}
        </button>
      </div>

      <div className="text-[10px] text-ink-dim text-center mt-2">
        {totalSets} sets total · log via the cards above
      </div>
    </div>
  );
}

function SectionBlock({
  label,
  section,
  date,
  week,
  dayOfWeek,
  logByExId,
  prevByExId,
}: {
  label: string;
  section: ProgramSection;
  date: string;
  week: number;
  dayOfWeek: number;
  logByExId: Map<string, Log>;
  prevByExId: Map<string, Log>;
}) {
  // Per-section progress
  let total = 0;
  let done = 0;
  for (const ex of section.exercises) {
    const log = logByExId.get(ex.id);
    const expected =
      log?.sets?.length ??
      prescribedSetCount(ex.prescription, ex.trackingType);
    total += expected;
    if (log) done += (log.sets ?? []).filter((s) => s.completed).length;
  }
  const pct = total ? done / total : 0;

  return (
    <section className="space-y-2 scroll-mt-4">
      <div className="flex items-end justify-between gap-3 border-t border-bg-line pt-4">
        <h2 className="display text-2xl font-bold">{label}</h2>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">
            {done}/{total}
          </div>
          <div className="h-1 w-16 rounded-full bg-bg-elev mt-1">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
      </div>

      {section.note && (
        <p className="text-[12px] text-ink-muted italic">{section.note}</p>
      )}
      {section.duration && (
        <div className="text-[10px] uppercase tracking-wider text-ink-dim">
          {section.duration}
          {section.rounds ? ` · ${section.rounds} rounds` : ""}
        </div>
      )}

      <div className="space-y-2">
        {section.exercises.map((ex: Exercise, i: number) => (
          <ExerciseCard
            key={`${ex.id}-${i}`}
            exercise={ex}
            log={logByExId.get(ex.id) ?? null}
            prevLog={prevByExId.get(ex.id) ?? null}
            date={date}
            week={week}
            dayOfWeek={dayOfWeek}
          />
        ))}
      </div>
    </section>
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

function phaseLabel(phase: number): string {
  if (phase === 1) return "Phase 1 · Reconditioning";
  if (phase === 2) return "Phase 2 · Threshold";
  return "Phase 3 · Hybrid Performance";
}
