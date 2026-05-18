"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BrandBanner } from "./Logo";

function nextMonday(): string {
  const d = new Date();
  const dow = d.getDay();
  const daysUntilMon = dow === 0 ? 1 : ((8 - dow) % 7) || 7;
  d.setDate(d.getDate() + daysUntilMon);
  return toISO(d);
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function todayMondayOrNext(): string {
  const d = new Date();
  if (d.getDay() === 1) return toISO(d);
  return nextMonday();
}

export function StartDateSetup() {
  const setStart = useMutation(api.settings.setStartDate);
  const [date, setDate] = useState(todayMondayOrNext());
  const [saving, setSaving] = useState(false);

  const valid = (() => {
    const [y, m, d] = date.split("-").map(Number);
    if (!y || !m || !d) return false;
    return new Date(y, m - 1, d).getDay() === 1;
  })();

  return (
    <div className="px-3 pt-1 pb-4">
      <BrandBanner className="mb-3" />

      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Welcome
        </p>
      </div>

      <p className="text-sm text-ink-muted leading-relaxed mb-6 max-w-sm">
        12 weeks. 5 training days per week. Pick the Monday you want to start —
        today if it&apos;s Monday, or any Monday in the future.
      </p>

      <div className="card p-3 mb-3">
        <label className="block">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2 font-semibold">
            Program start (Monday)
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-3 rounded-lg bg-bg-elev border border-bg-line text-lg display font-bold text-ink focus:outline-none focus:border-brand"
          />
        </label>
        {!valid && date && (
          <div className="text-[11px] text-amber-300 mt-2">
            Pick a Monday. The program runs Mon–Fri.
          </div>
        )}
      </div>

      <button
        disabled={!valid || saving}
        onClick={async () => {
          setSaving(true);
          await setStart({ programStartDate: date });
          setSaving(false);
        }}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {saving ? "Saving…" : "Begin program"}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
