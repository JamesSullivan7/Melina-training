"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cx } from "@/lib/utils";

/**
 * We deliberately use type="text" + inputMode="decimal" instead of
 * type="number". On mobile (iOS Safari especially), type="number" with
 * a non-integer step (e.g. 0.5 for RPE, 2.5 for weight) blocks typing
 * intermediate values and has flaky focus behavior. type="text" with
 * inputMode="decimal" still surfaces the numeric keypad without those
 * quirks, and we parse the value ourselves.
 */
export function NumberStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  placeholder = "",
  suffix,
  className,
  inputClassName,
  ariaLabel,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  suffix?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
}) {
  // Keep the visible text decoupled from `value` so the user can type
  // partial input like "1." or "" without us snapping it back.
  const [draft, setDraft] = useState<string>(value === undefined ? "" : String(value));

  // Sync from parent when the value changes externally (e.g. via +/-
  // buttons, or a fresh log loading in). Avoid clobbering the draft if
  // it already parses to the same number.
  useEffect(() => {
    const parsed = draft === "" ? undefined : Number(draft);
    const same =
      (parsed === undefined && value === undefined) ||
      (typeof parsed === "number" && parsed === value);
    if (!same) {
      setDraft(value === undefined ? "" : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const next = (delta: number) => {
    const v = (value ?? 0) + delta;
    if (typeof max === "number" && v > max) return;
    if (typeof min === "number" && v < min) return;
    onChange(v);
  };

  const handleChange = (raw: string) => {
    // Allow empty.
    if (raw === "") {
      setDraft("");
      onChange(undefined);
      return;
    }
    // Only accept digits with an optional single decimal point.
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setDraft(raw);
    // Don't push partial input like "." or "1." to the parent —
    // wait until it parses to a real number.
    const num = Number(raw);
    if (raw.endsWith(".") || raw === "") return;
    if (!Number.isFinite(num)) return;
    onChange(num);
  };

  return (
    <div className={cx("flex items-stretch gap-1", className)}>
      <button
        type="button"
        onClick={() => next(-step)}
        className="h-9 w-9 rounded-lg bg-bg-elev tap flex items-center justify-center text-ink-muted active:bg-bg-line"
        aria-label="Decrease"
      >
        <Minus size={14} />
      </button>
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          autoComplete="off"
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cx("num-input pr-6", inputClassName)}
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-dim pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => next(step)}
        className="h-9 w-9 rounded-lg bg-bg-elev tap flex items-center justify-center text-ink-muted active:bg-bg-line"
        aria-label="Increase"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
