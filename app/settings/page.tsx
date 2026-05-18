"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LogoCompact } from "@/components/Logo";

function isMondayISO(iso: string): boolean {
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return false;
  return new Date(y, m - 1, d).getDay() === 1;
}

export default function SettingsPage() {
  const settings = useQuery(api.settings.get);
  const setStart = useMutation(api.settings.setStartDate);

  if (settings === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LogoCompact size="md" className="opacity-50" />
      </div>
    );
  }

  return (
    <Inner
      key={settings?._id ?? "none"}
      initialStart={settings?.programStartDate ?? ""}
      onSave={(d) => setStart({ programStartDate: d })}
    />
  );
}

function Inner({
  initialStart,
  onSave,
}: {
  initialStart: string;
  onSave: (date: string) => Promise<unknown>;
}) {
  const [date, setDate] = useState(initialStart);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const valid = isMondayISO(date);

  async function handleSave() {
    if (!valid) return;
    setSaving(true);
    await onSave(date);
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <div className="px-3 pt-4 pb-4">
      <header className="flex items-center gap-2 mb-4">
        <LogoCompact size="md" />
      </header>

      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Configuration
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">Settings</h1>
      </div>

      <div className="card p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2 font-semibold">
          Program start (Monday)
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg-elev border border-bg-line text-ink focus:outline-none focus:border-brand"
        />
        {!valid && date && (
          <div className="text-[11px] text-amber-300 mt-1.5">
            Pick a Monday. The program runs Mon–Fri.
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!valid || saving}
          className="btn btn-primary w-full mt-3 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Update start date"}
        </button>
        {savedAt && (
          <div className="text-center text-[11px] text-emerald-400 mt-2 tracking-wider">
            ✓ Saved
          </div>
        )}
      </div>

      <div className="card p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1 font-semibold">
          About
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          12-week Tulsa Training hybrid conditioning program. Day-level
          completion tracking with per-set exercise weight logging. Built mobile
          first.
        </p>
      </div>
    </div>
  );
}
