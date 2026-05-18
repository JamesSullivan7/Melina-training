"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { LogoCompact } from "@/components/Logo";
import { DAY_NAMES } from "@/lib/programDate";
import { cx } from "@/lib/utils";

type Day = Doc<"programDays">;

export default function ProgramPage() {
  const all = useQuery(api.programDays.listAll) as Day[] | undefined;

  if (all === undefined) {
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
          12-Week Hybrid Conditioning
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">Program</h1>
      </div>

      {[1, 2, 3].map((phase) => {
        const weeks = Array.from(
          new Set(all.filter((d) => d.phase === phase).map((d) => d.week)),
        ).sort((a, b) => a - b);
        return (
          <div key={phase} className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-brand font-semibold">
                Phase {phase} · {phaseShort(phase)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-ink-dim">
                Weeks {weeks[0]}–{weeks[weeks.length - 1]}
              </span>
            </div>
            <div className="space-y-2">
              {weeks.map((w) => {
                const days = all
                  .filter((d) => d.week === w)
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
                const isAnchor = days[0]?.isAnchor;
                return (
                  <div key={w} className="card overflow-hidden">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-bg-line">
                      <div className="display text-lg font-bold">
                        Week {w}
                      </div>
                      {isAnchor && (
                        <span className="chip border bg-brand/15 text-brand border-brand/30">
                          Anchor
                        </span>
                      )}
                    </div>
                    <ul>
                      {days.map((d, i) => (
                        <li
                          key={d._id}
                          className={cx(
                            "px-3 py-2 flex items-center justify-between gap-2",
                            i < days.length - 1 && "border-b border-bg-line",
                          )}
                        >
                          <Link
                            href={`/workout/${d.week}/${d.dayOfWeek}`}
                            className="flex items-center justify-between gap-2 w-full"
                          >
                            <div className="min-w-0">
                              <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                                {DAY_NAMES[d.dayOfWeek - 1]}
                              </div>
                              <div className="text-sm text-ink truncate">
                                {d.title}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-ink-dim">
                                {d.intensity}
                              </span>
                              <ChevronRight
                                size={14}
                                className="text-ink-muted"
                              />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function phaseShort(phase: number): string {
  if (phase === 1) return "Reconditioning";
  if (phase === 2) return "Threshold";
  return "Hybrid Performance";
}
