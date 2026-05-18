"use client";

import { Minus, Plus } from "lucide-react";
import { cx } from "@/lib/utils";

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
  const next = (delta: number) => {
    const v = (value ?? 0) + delta;
    if (typeof max === "number" && v > max) return;
    if (typeof min === "number" && v < min) return;
    onChange(v);
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
          inputMode="decimal"
          type="number"
          step={step}
          min={min}
          max={max}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cx("num-input pr-6", inputClassName)}
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? undefined : Number(v));
          }}
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
