export function ProgressRing({
  value,
  size = 80,
  stroke = 8,
  label,
  sub,
  color = "#D93B58",
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  color?: string;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = circ * Math.max(0, Math.min(1, value));
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-lg font-bold tabular-nums">{label}</span>
        )}
        {sub && <span className="text-[10px] text-ink-muted">{sub}</span>}
      </div>
    </div>
  );
}
