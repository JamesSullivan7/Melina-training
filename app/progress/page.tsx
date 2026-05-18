"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { LogoCompact } from "@/components/Logo";
import { TrendingUp } from "lucide-react";
import { e1rm, formatLb } from "@/lib/lifts";
import { cx } from "@/lib/utils";

type Day = Doc<"programDays">;
type Log = Doc<"exerciseLogs">;

export default function ProgressPage() {
  const allDays = useQuery(api.programDays.listAll) as Day[] | undefined;
  const lastByExercise = useQuery(api.exerciseLogs.lastByExercise) as
    | Log[]
    | undefined;

  if (allDays === undefined || lastByExercise === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LogoCompact size="md" className="opacity-50" />
      </div>
    );
  }

  const lifts = (() => {
    const seen = new Map<string, string>();
    for (const d of allDays) {
      for (const sec of [d.warmup, d.mainBlock, d.conditioningBlock, d.cooldown]) {
        for (const ex of sec.exercises) {
          if (ex.trackingType === "weight_reps_rpe" && !seen.has(ex.id)) {
            seen.set(ex.id, ex.name);
          }
        }
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  })();

  const lastById = new Map<string, Log>();
  for (const l of lastByExercise) lastById.set(l.exerciseId, l);

  const sorted = [...lifts].sort((a, b) => {
    const la = lastById.get(a.id);
    const lb = lastById.get(b.id);
    if (la && lb) return la.date > lb.date ? -1 : 1;
    if (la) return -1;
    if (lb) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="px-3 pt-4 pb-4">
      <header className="flex items-center gap-2 mb-4">
        <LogoCompact size="md" />
      </header>

      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Strength tracking
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">
          Progress
        </h1>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-4 text-center">
          <TrendingUp
            size={28}
            className="mx-auto text-ink-dim mb-2"
          />
          <div className="text-sm text-ink-muted">
            No lifts in the program yet.
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((lift) => (
            <LiftRow
              key={lift.id}
              lift={lift}
              last={lastById.get(lift.id) ?? null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LiftRow({
  lift,
  last,
}: {
  lift: { id: string; name: string };
  last: Log | null;
}) {
  const [open, setOpen] = useState(false);
  const history = useQuery(
    api.exerciseLogs.historyForExercise,
    open ? { exerciseId: lift.id } : "skip",
  ) as Log[] | undefined;

  // Best e1RM across logged sets.
  const bestE1rm = (() => {
    if (!history) return undefined;
    let best = 0;
    for (const log of history) {
      for (const s of log.sets ?? []) {
        if (s.weight && s.reps) {
          const r = e1rm(s.weight, s.reps);
          if (r > best) best = r;
        }
      }
    }
    return best || undefined;
  })();

  const topSet = last?.sets
    ?.filter((s) => s.weight && s.reps)
    .sort((a, b) => (b.weight! - a.weight!))[0];

  return (
    <li className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-3 flex items-center justify-between text-left tap"
      >
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink truncate">{lift.name}</div>
          {last && topSet ? (
            <div className="text-[11px] text-ink-muted mt-0.5">
              Last:{" "}
              <span className="text-ink">
                {formatLb(topSet.weight)} lb × {topSet.reps}
              </span>
              {topSet.rpe ? ` @ RPE ${topSet.rpe}` : ""} · {formatDate(last.date)}
            </div>
          ) : (
            <div className="text-[11px] text-ink-dim mt-0.5">
              Not logged yet
            </div>
          )}
        </div>
        {topSet?.weight && topSet?.reps && (
          <div className="text-right shrink-0 ml-3">
            <div className="display text-base font-bold text-brand leading-none">
              {formatLb(e1rm(topSet.weight, topSet.reps))}
            </div>
            <div className="text-[8px] uppercase tracking-wider text-ink-dim mt-0.5">
              e1RM
            </div>
          </div>
        )}
      </button>

      {open && (
        <div
          className={cx(
            "px-3 pb-3 pt-1",
            "border-t border-bg-line",
          )}
        >
          {history === undefined ? (
            <div className="py-3 text-center text-[11px] text-ink-muted">
              Loading…
            </div>
          ) : history.length === 0 ? (
            <div className="py-3 text-center text-[11px] text-ink-muted">
              No history yet.
            </div>
          ) : (
            <>
              {bestE1rm !== undefined && (
                <div className="text-[10px] uppercase tracking-wider text-ink-dim mt-2 mb-1">
                  Best e1RM ·{" "}
                  <span className="text-brand">
                    {formatLb(bestE1rm)} lb
                  </span>
                </div>
              )}
              <ul className="space-y-1">
                {history.map((h) => (
                  <li
                    key={h._id}
                    className="text-[12px] py-1 border-t border-bg-line first:border-t-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted">
                        W{h.week} · {formatDate(h.date)}
                      </span>
                      <span className="text-ink">
                        {(h.sets ?? []).length} set
                        {(h.sets ?? []).length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="text-[11px] text-ink-muted mt-0.5 space-y-0.5">
                      {(h.sets ?? []).map((s) => (
                        <li key={s.setNumber} className="flex items-center gap-2">
                          <span className="text-ink-dim">#{s.setNumber}</span>
                          <span>
                            {formatLb(s.weight)} lb × {s.reps ?? "?"}
                            {s.rpe ? ` @ ${s.rpe}` : ""}
                          </span>
                          {s.completed && (
                            <span className="text-emerald-400 text-[10px]">
                              ✓
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
