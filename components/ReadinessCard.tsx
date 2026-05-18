"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { HeartPulse } from "lucide-react";
import { computeReadiness, type Readiness } from "@/lib/readiness";
import { cx } from "@/lib/utils";

const STYLE: Record<
  Readiness,
  { dot: string; chip: string; label: string }
> = {
  green: {
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 border-emerald-500/40 text-emerald-300",
    label: "READY",
  },
  yellow: {
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 border-amber-500/40 text-amber-300",
    label: "MANAGE",
  },
  red: {
    dot: "bg-red-400",
    chip: "bg-red-500/10 border-red-500/40 text-red-300",
    label: "RECOVER",
  },
  unknown: {
    dot: "bg-ink-dim",
    chip: "bg-bg-elev border-bg-line text-ink-muted",
    label: "—",
  },
};

export function ReadinessCard() {
  const recent = useQuery(api.dailyLogs.getMostRecent) as
    | Doc<"dailyLogs">
    | null
    | undefined;

  if (recent === undefined) return null; // loading — keep dashboard layout stable

  const signal = computeReadiness(recent);
  const s = STYLE[signal.level];

  return (
    <Link
      href="/recovery"
      className="card p-2.5 mb-2 flex items-center gap-2.5 tap"
    >
      <span
        className={cx("h-2.5 w-2.5 rounded-full shrink-0", s.dot)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">
            Readiness
          </span>
          <span
            className={cx(
              "chip border",
              s.chip,
            )}
          >
            {s.label}
          </span>
        </div>
        <p className="text-[12px] text-ink leading-snug mt-0.5 truncate">
          {signal.message}
        </p>
      </div>
      <HeartPulse size={16} className="text-ink-muted shrink-0" />
    </Link>
  );
}
