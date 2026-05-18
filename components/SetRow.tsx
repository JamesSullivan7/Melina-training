"use client";

import { Check, Trash2 } from "lucide-react";
import { cx } from "@/lib/utils";
import { NumberStepper } from "./NumberStepper";
import type { Exercise, TrackingType } from "@/convex/types";

export type SetLog = {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  meters?: number;
  calories?: number;
  timeSeconds?: number;
  completed: boolean;
};

export type Units = "lb" | "kg";

export function SetRow({
  set,
  exercise,
  units,
  prevSet,
  onChange,
  onRemove,
  canRemove,
}: {
  set: SetLog;
  exercise: Exercise;
  units: Units;
  prevSet?: SetLog;
  onChange: (patch: Partial<SetLog>) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const t = exercise.trackingType;
  const completed = set.completed;

  const toggleComplete = () => onChange({ completed: !completed });

  return (
    <div
      className={cx(
        "grid items-center gap-2 rounded-xl border px-2 py-2",
        completed
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-bg-line bg-bg-elev/50",
      )}
      style={{ gridTemplateColumns: "28px 1fr 36px" }}
    >
      <div className="flex items-center justify-center">
        <span className="text-xs font-bold text-ink-muted tabular-nums">
          {set.setNumber}
        </span>
      </div>

      <div className="min-w-0">
        {renderFields(t, set, exercise, units, prevSet, onChange)}
      </div>

      <div className="flex flex-col items-center justify-center gap-1">
        <button
          type="button"
          onClick={toggleComplete}
          className={cx(
            "h-9 w-9 rounded-lg tap flex items-center justify-center transition-colors",
            completed
              ? "bg-emerald-500 text-bg"
              : "bg-bg border border-bg-line text-ink-muted",
          )}
          aria-label="Mark set complete"
        >
          <Check size={16} strokeWidth={3} />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-ink-dim hover:text-red-400 tap"
            aria-label="Remove set"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function renderFields(
  t: TrackingType,
  set: SetLog,
  exercise: Exercise,
  units: Units,
  prev: SetLog | undefined,
  onChange: (patch: Partial<SetLog>) => void,
) {
  const prevHint = prev ? prevHintString(t, prev, units) : null;

  if (t === "weight_reps_rpe") {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        <FieldShell label={units}>
          <NumberStepper
            value={set.weight}
            onChange={(v) => onChange({ weight: v })}
            step={2.5}
            ariaLabel="Weight"
          />
        </FieldShell>
        <FieldShell label="reps">
          <NumberStepper
            value={set.reps}
            onChange={(v) => onChange({ reps: v })}
            step={1}
            ariaLabel="Reps"
          />
        </FieldShell>
        <FieldShell label="RPE">
          <NumberStepper
            value={set.rpe}
            onChange={(v) => onChange({ rpe: v })}
            step={0.5}
            min={1}
            max={10}
            ariaLabel="RPE"
          />
        </FieldShell>
        {prevHint && <PrevHint hint={prevHint} className="col-span-3" />}
      </div>
    );
  }

  if (t === "reps_rpe" || t === "bodyweight_reps") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <FieldShell label="reps">
          <NumberStepper
            value={set.reps}
            onChange={(v) => onChange({ reps: v })}
            step={1}
            ariaLabel="Reps"
          />
        </FieldShell>
        <FieldShell label="RPE">
          <NumberStepper
            value={set.rpe}
            onChange={(v) => onChange({ rpe: v })}
            step={0.5}
            min={1}
            max={10}
            ariaLabel="RPE"
          />
        </FieldShell>
        {prevHint && <PrevHint hint={prevHint} className="col-span-2" />}
      </div>
    );
  }

  if (t === "calories") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <FieldShell label="cal">
          <NumberStepper
            value={set.calories}
            onChange={(v) => onChange({ calories: v })}
            step={1}
            ariaLabel="Calories"
          />
        </FieldShell>
        <FieldShell label="RPE">
          <NumberStepper
            value={set.rpe}
            onChange={(v) => onChange({ rpe: v })}
            step={0.5}
            min={1}
            max={10}
            ariaLabel="RPE"
          />
        </FieldShell>
        {prevHint && <PrevHint hint={prevHint} className="col-span-2" />}
      </div>
    );
  }

  if (t === "distance_meters" || t === "carry_distance") {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        <FieldShell label="m">
          <NumberStepper
            value={set.meters}
            onChange={(v) => onChange({ meters: v })}
            step={10}
            ariaLabel="Meters"
          />
        </FieldShell>
        <FieldShell label={units}>
          <NumberStepper
            value={set.weight}
            onChange={(v) => onChange({ weight: v })}
            step={2.5}
            ariaLabel="Load"
          />
        </FieldShell>
        <FieldShell label="RPE">
          <NumberStepper
            value={set.rpe}
            onChange={(v) => onChange({ rpe: v })}
            step={0.5}
            min={1}
            max={10}
            ariaLabel="RPE"
          />
        </FieldShell>
        {prevHint && <PrevHint hint={prevHint} className="col-span-3" />}
      </div>
    );
  }

  if (t === "timed_hold" || t === "duration") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <FieldShell label="sec">
          <NumberStepper
            value={set.timeSeconds}
            onChange={(v) => onChange({ timeSeconds: v })}
            step={5}
            ariaLabel="Seconds"
          />
        </FieldShell>
        <FieldShell label="RPE">
          <NumberStepper
            value={set.rpe}
            onChange={(v) => onChange({ rpe: v })}
            step={0.5}
            min={1}
            max={10}
            ariaLabel="RPE"
          />
        </FieldShell>
        {prevHint && <PrevHint hint={prevHint} className="col-span-2" />}
      </div>
    );
  }

  // "check" — warmup style — just tap the check button to log completion
  return (
    <div className="px-1 text-sm text-ink-muted">
      {exercise.prescription}
      {prevHint && <PrevHint hint={prevHint} className="mt-1" />}
    </div>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-ink-dim mb-0.5 pl-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function PrevHint({ hint, className }: { hint: string; className?: string }) {
  return (
    <div className={cx("text-[10px] text-ink-dim pl-0.5", className)}>
      prev: {hint}
    </div>
  );
}

function prevHintString(
  t: TrackingType,
  prev: SetLog,
  units: Units,
): string | null {
  if (t === "weight_reps_rpe") {
    if (prev.weight && prev.reps)
      return `${prev.weight} ${units} × ${prev.reps}${prev.rpe ? ` @ RPE ${prev.rpe}` : ""}`;
  }
  if (t === "reps_rpe" || t === "bodyweight_reps") {
    if (prev.reps)
      return `${prev.reps} reps${prev.rpe ? ` @ RPE ${prev.rpe}` : ""}`;
  }
  if (t === "calories") {
    if (prev.calories)
      return `${prev.calories} cal${prev.rpe ? ` @ RPE ${prev.rpe}` : ""}`;
  }
  if (t === "distance_meters" || t === "carry_distance") {
    if (prev.meters)
      return `${prev.meters}m${prev.weight ? ` @ ${prev.weight} ${units}` : ""}`;
  }
  if ((t === "timed_hold" || t === "duration") && prev.timeSeconds)
    return `${prev.timeSeconds}s`;
  return null;
}
