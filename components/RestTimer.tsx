"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { cx } from "@/lib/utils";

type Props = {
  /** Total seconds for the countdown. */
  seconds: number;
  /** Optional label (exercise name) shown above the countdown. */
  label?: string;
  /** Fires when the timer hits 0 (auto) or the user dismisses. */
  onDone: () => void;
};

/**
 * Sticky bottom-of-screen rest countdown. Sits ~12px above the bottom
 * nav. Auto-dismisses at 0. Tappable +30s and × to close early.
 */
export function RestTimer({ seconds, label, onDone }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, onDone]);

  const total = Math.max(seconds, remaining); // grow if user added time
  const pct = Math.max(0, Math.min(1, remaining / total));
  const color =
    remaining <= 5
      ? "var(--tt-brand)"
      : remaining <= 15
        ? "#f59e0b"
        : "#22c55e";

  return (
    <div
      className="fixed inset-x-0 z-40 px-3 pointer-events-none"
      style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      <div
        className="mx-auto max-w-screen-md pointer-events-auto card-elev px-3 py-2 flex items-center gap-3 tt-fade-up"
        style={{
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 -12px 30px -10px rgba(217,59,88,0.25)",
        }}
      >
        <div
          ref={ringRef}
          className="relative shrink-0"
          style={{ width: 44, height: 44 }}
        >
          <svg width={44} height={44} className="-rotate-90">
            <circle
              cx={22}
              cy={22}
              r={18}
              fill="none"
              stroke="var(--tt-bg-line)"
              strokeWidth={4}
            />
            <circle
              cx={22}
              cy={22}
              r={18}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeDasharray={`${2 * Math.PI * 18 * pct} ${2 * Math.PI * 18}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="display font-bold tabular text-[15px] leading-none"
              style={{ color }}
            >
              {remaining}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            Rest
          </div>
          <div className="text-[12px] text-ink truncate">
            {label ?? "Next set"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRemaining((r) => Math.min(r + 30, 600))}
          className={cx(
            "h-9 px-2.5 rounded-lg bg-bg-elev border border-bg-line text-ink-muted",
            "flex items-center gap-1 text-[11px] font-semibold tap",
          )}
          aria-label="Add 30 seconds"
        >
          <Plus size={12} /> 30
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 w-9 rounded-lg flex items-center justify-center bg-bg-elev border border-bg-line text-ink-muted tap"
          aria-label="Close timer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
