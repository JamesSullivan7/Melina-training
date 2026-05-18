"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { LogoCompact } from "@/components/Logo";
import { HeartPulse } from "lucide-react";
import { computeCoord, DAY_NAMES, todayISO } from "@/lib/programDate";
import { cx } from "@/lib/utils";

type Cardio = "Poor" | "Okay" | "Good" | "Great";
type DailyLog = Doc<"dailyLogs">;

export default function RecoveryPage() {
  const settings = useQuery(api.settings.get);
  const existing = useQuery(api.dailyLogs.getByDate, { date: todayISO() });
  const coord = computeCoord(settings?.programStartDate ?? undefined);

  if (settings === undefined || existing === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LogoCompact size="md" className="opacity-50" />
      </div>
    );
  }

  if (!settings?.programStartDate) {
    return (
      <div className="px-3 pt-4 pb-4">
        <LogoCompact size="md" />
        <div className="card p-4 mt-4 text-center">
          <div className="display text-2xl font-bold mb-2">Setup needed</div>
          <p className="text-sm text-ink-muted">
            Pick a program start date on the Home tab before logging.
          </p>
        </div>
      </div>
    );
  }

  if (coord.isRestDay) {
    return (
      <div className="px-3 pt-4 pb-4">
        <LogoCompact size="md" />
        <div className="card p-4 mt-4 text-center">
          <HeartPulse size={28} className="mx-auto text-brand mb-2" />
          <div className="display text-3xl font-bold mb-1">Rest day</div>
          <p className="text-sm text-ink-muted">
            Weekends are recovery. Come back Monday.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LogForm
      key={existing?._id ?? "new"}
      initial={existing ?? null}
      week={coord.week}
      dayOfWeek={coord.dayOfWeek}
    />
  );
}

function LogForm({
  initial,
  week,
  dayOfWeek,
}: {
  initial: DailyLog | null;
  week: number;
  dayOfWeek: number;
}) {
  const upsert = useMutation(api.dailyLogs.upsert);

  const [completed, setCompleted] = useState<boolean>(initial?.completed ?? true);
  const [rpe, setRpe] = useState<number | undefined>(initial?.rpe);
  const [energyBefore, setEnergyBefore] = useState<number | undefined>(
    initial?.energyBefore,
  );
  const [energyAfter, setEnergyAfter] = useState<number | undefined>(
    initial?.energyAfter,
  );
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(
    initial?.sleepQuality,
  );
  const [soreness, setSoreness] = useState<number | undefined>(initial?.soreness);
  const [cardioPerformance, setCardioPerformance] = useState<Cardio | undefined>(
    initial?.cardioPerformance as Cardio | undefined,
  );
  const [warmupCompleted, setWarmupCompleted] = useState<boolean | undefined>(
    initial?.warmupCompleted,
  );
  const [cooldownCompleted, setCooldownCompleted] = useState<boolean | undefined>(
    initial?.cooldownCompleted,
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    setSaving(true);
    await upsert({
      date: todayISO(),
      week,
      dayOfWeek,
      completed,
      rpe,
      energyBefore,
      energyAfter,
      sleepQuality,
      soreness,
      cardioPerformance,
      warmupCompleted,
      cooldownCompleted,
      notes: notes || undefined,
    });
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
          Week {week} · {DAY_NAMES[dayOfWeek - 1]}
        </p>
        <h1 className="display text-4xl font-bold leading-none mt-1">
          Recovery
        </h1>
      </div>

      <div className="card p-3 mb-3">
        <FieldGroup label="Workout completed?">
          <YesNo value={completed} onChange={setCompleted} />
        </FieldGroup>
      </div>

      <div className="card p-3 mb-3 space-y-4">
        <FieldGroup label="Overall RPE">
          <Scale10 value={rpe} onChange={setRpe} kind="rpe" />
        </FieldGroup>
        <FieldGroup label="Energy before">
          <Scale10 value={energyBefore} onChange={setEnergyBefore} kind="positive" />
        </FieldGroup>
        <FieldGroup label="Energy after">
          <Scale10 value={energyAfter} onChange={setEnergyAfter} kind="positive" />
        </FieldGroup>
        <FieldGroup label="Sleep quality (last night)">
          <Scale10 value={sleepQuality} onChange={setSleepQuality} kind="positive" />
        </FieldGroup>
        <FieldGroup label="Soreness">
          <Scale10 value={soreness} onChange={setSoreness} kind="inverse" />
        </FieldGroup>
      </div>

      <div className="card p-3 mb-3 space-y-4">
        <FieldGroup label="Cardio performance">
          <CardioPicker
            value={cardioPerformance}
            onChange={setCardioPerformance}
          />
        </FieldGroup>
        <FieldGroup label="Warm-up done?">
          <YesNo value={warmupCompleted} onChange={setWarmupCompleted} />
        </FieldGroup>
        <FieldGroup label="Cooldown / mobility done?">
          <YesNo value={cooldownCompleted} onChange={setCooldownCompleted} />
        </FieldGroup>
      </div>

      <div className="card p-3 mb-3">
        <FieldGroup label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How did it feel? Anything to flag…"
            className="w-full text-sm bg-bg border border-bg-line rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
          />
        </FieldGroup>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {saving ? "Saving…" : initial ? "Update log" : "Save log"}
      </button>

      {savedAt && (
        <div className="text-center text-[11px] text-emerald-400 mt-3 tracking-wider">
          ✓ Saved
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2 font-semibold">
        {label}
      </div>
      {children}
    </div>
  );
}

function YesNo({
  value,
  onChange,
}: {
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: "Yes", val: true, on: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
        { label: "No", val: false, on: "border-brand/40 bg-brand/10 text-brand" },
      ].map((opt) => {
        const active = value === opt.val;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.val)}
            className={cx(
              "py-2.5 rounded-lg font-semibold text-sm border tap",
              active
                ? opt.on
                : "border-bg-line bg-bg-elev/40 text-ink-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Scale10({
  value,
  onChange,
  kind,
}: {
  value?: number;
  onChange: (n: number) => void;
  kind: "positive" | "inverse" | "rpe";
}) {
  function activeClass(n: number): string {
    if (kind === "positive") {
      if (n <= 3) return "bg-red-500 border-red-500 text-white";
      if (n <= 6) return "bg-amber-500 border-amber-500 text-white";
      return "bg-emerald-500 border-emerald-500 text-white";
    }
    if (kind === "inverse") {
      if (n >= 8) return "bg-red-500 border-red-500 text-white";
      if (n >= 5) return "bg-amber-500 border-amber-500 text-white";
      return "bg-emerald-500 border-emerald-500 text-white";
    }
    if (n >= 9) return "bg-red-500 border-red-500 text-white";
    if (n >= 7) return "bg-amber-500 border-amber-500 text-white";
    return "bg-emerald-500 border-emerald-500 text-white";
  }
  return (
    <div className="grid grid-cols-10 gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cx(
              "h-10 rounded-md font-semibold text-sm border tap tabular",
              active
                ? activeClass(n)
                : "bg-bg-elev/50 border-bg-line text-ink-muted",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function CardioPicker({
  value,
  onChange,
}: {
  value?: Cardio;
  onChange: (v: Cardio) => void;
}) {
  const opts: Cardio[] = ["Poor", "Okay", "Good", "Great"];
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {opts.map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cx(
              "py-2.5 rounded-md font-semibold text-xs border tap",
              active
                ? "bg-brand border-brand text-white"
                : "bg-bg-elev/50 border-bg-line text-ink-muted",
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
