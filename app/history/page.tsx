"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { LogoCompact } from "@/components/Logo";
import { DAY_NAMES } from "@/lib/programDate";

type DailyLog = Doc<"dailyLogs">;

export default function HistoryPage() {
  const logs = useQuery(api.dailyLogs.listAll) as DailyLog[] | undefined;

  if (logs === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LogoCompact size="md" className="opacity-50" />
      </div>
    );
  }

  return (
    <div className="px-3 pt-4 pb-4">
      <header className="flex items-center gap-2 mb-4">
        <LogoCompact size="md" />
      </header>

      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Daily logs
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">History</h1>
      </div>

      {logs.length === 0 ? (
        <div className="card p-4 text-center">
          <div className="text-sm text-ink-muted">
            No sessions logged yet. Hit the Recovery tab after your next workout.
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {logs.map((l) => (
            <li key={l._id} className="card p-3">
              <div className="flex items-baseline justify-between mb-1">
                <div className="display text-lg font-bold">
                  Week {l.week} · {DAY_NAMES[l.dayOfWeek - 1]}
                </div>
                <div className="text-[10px] text-ink-dim uppercase tracking-wider">
                  {formatDate(l.date)}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted">
                {l.rpe !== undefined && <span>RPE {l.rpe}</span>}
                {l.energyAfter !== undefined && (
                  <span>Energy {l.energyAfter}/10</span>
                )}
                {l.sleepQuality !== undefined && (
                  <span>Sleep {l.sleepQuality}/10</span>
                )}
                {l.soreness !== undefined && (
                  <span>Soreness {l.soreness}/10</span>
                )}
                {l.cardioPerformance && <span>Cardio {l.cardioPerformance}</span>}
              </div>
              {l.notes && (
                <p className="text-xs text-ink mt-2 leading-snug">{l.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
