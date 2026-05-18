import { cx } from "@/lib/utils";

function rpeColor(rpe: number | "hard") {
  if (rpe === "hard")
    return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  if (rpe >= 9) return "bg-red-500/15 text-red-300 border-red-500/30";
  if (rpe >= 8) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (rpe >= 7) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return "bg-bg-elev text-ink-muted border-bg-line";
}

export function RPEChip({
  rpe,
  className,
}: {
  rpe: number | [number, number] | "hard" | undefined;
  className?: string;
}) {
  if (rpe === undefined) return null;
  const label = Array.isArray(rpe)
    ? `RPE ${rpe[0]}–${rpe[1]}`
    : rpe === "hard"
      ? "RPE 8–9"
      : `RPE ${rpe}`;
  const colorSeed = Array.isArray(rpe) ? rpe[1] : rpe;
  return (
    <span className={cx("chip border", rpeColor(colorSeed), className)}>
      {label}
    </span>
  );
}
