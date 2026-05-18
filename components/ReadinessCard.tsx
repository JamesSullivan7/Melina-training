"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { HeartPulse, ChevronRight } from "lucide-react";
import { computeReadiness, type Readiness } from "@/lib/readiness";
import { cx } from "@/lib/utils";

const STYLE: Record<
  Readiness,
  {
    label: string;
    border: string;
    icon: string;
    chip: string;
    msg: string;
  }
> = {
  green: {
    label: "READY",
    border: "border-emerald-500/50",
    icon: "text-emerald-400",
    chip: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    msg: "text-emerald-300",
  },
  yellow: {
    label: "MANAGE",
    border: "border-amber-500/50",
    icon: "text-amber-400",
    chip: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    msg: "text-amber-300",
  },
  red: {
    label: "RECOVER",
    border: "border-red-500/50",
    icon: "text-red-400",
    chip: "bg-red-500/15 border-red-500/40 text-red-300",
    msg: "text-red-300",
  },
  unknown: {
    label: "—",
    border: "border-emerald-500/40",
    icon: "text-emerald-400",
    chip: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    msg: "text-emerald-300",
  },
};

export function ReadinessCard() {
  const recent = useQuery(api.dailyLogs.getMostRecent) as
    | Doc<"dailyLogs">
    | null
    | undefined;

  if (recent === undefined) return null;

  const signal = computeReadiness(recent);
  const s = STYLE[signal.level];

  const headline =
    signal.level === "unknown"
      ? "No readiness logged — proceed as planned."
      : signal.message;

  return (
    <Link
      href="/recovery"
      className={cx(
        "card p-3 mb-2 flex items-center gap-3 tap border-2",
        s.border,
      )}
    >
      <HeartPulse size={20} className={cx("shrink-0", s.icon)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
            Readiness
          </span>
          {signal.level !== "unknown" && (
            <span className={cx("chip border", s.chip)}>{s.label}</span>
          )}
        </div>
        <p className={cx("text-[13px] leading-snug", s.msg)}>
          {headline}
        </p>
      </div>
      <ChevronRight size={16} className="text-ink-muted shrink-0" />
    </Link>
  );
}
