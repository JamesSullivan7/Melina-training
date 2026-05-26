"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

/**
 * Plain numeric input — no +/- steppers (they were squeezing the field
 * to ~5px wide on narrow phones, hiding typed values).
 *
 * We use type="text" + inputMode="decimal" instead of type="number".
 * type="number" with a non-integer step blocks intermediate keystrokes
 * on mobile, so we parse the value ourselves.
 *
 * `step`, `min`, `max` are accepted but unused — kept on the API so
 * existing call sites keep compiling.
 */
export function NumberStepper({
  value,
  onChange,
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
  // Local draft string decouples the visible text from `value` so the
  // user can type partial input like "1." or "" without it snapping back.
  const [draft, setDraft] = useState<string>(
    value === undefined ? "" : String(value),
  );

  // Sync from parent when value changes externally (a fresh log loading
  // in). Don't clobber the draft if it already parses to the same number.
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

  const handleChange = (raw: string) => {
    if (raw === "") {
      setDraft("");
      onChange(undefined);
      return;
    }
    // Only accept digits with an optional single decimal point.
    if (!/^\d*\.?\d*$/.test(raw)) return;
    setDraft(raw);
    // Don't push partial input like "1." to the parent — wait until
    // it parses to a real number.
    if (raw.endsWith(".")) return;
    const num = Number(raw);
    if (!Number.isFinite(num)) return;
    onChange(num);
  };

  return (
    <div className={cx("relative", className)}>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={cx("num-input", suffix ? "pr-6" : "", inputClassName)}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
      />
      {suffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-dim pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
