import Image from "next/image";
import { cx } from "@/lib/utils";

/**
 * The Tulsa Training brand mark — the brush-stroke "t" — used as the primary
 * brand icon throughout the app. Always uses the real PNG asset (do NOT
 * approximate this in SVG); the brush texture and asymmetry are part of the
 * brand identity.
 */
export function TTMark({
  size = 24,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/tulsa-t-mark.png"
      alt="Tulsa Training"
      width={size}
      height={size}
      priority={priority}
      className={cx("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}

/**
 * Wide brand banner — T mark + "TULSA TRAINING" on one line, centered.
 * Used at the top of welcome and dashboard so the brand spans the
 * full mobile width.
 */
export function BrandBanner({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "w-full flex items-center justify-center gap-3 py-1",
        className,
      )}
    >
      <TTMark size={112} priority />
      <span className="display font-bold tracking-tight text-ink text-[40px] leading-none">
        TULSA TRAINING
      </span>
    </div>
  );
}

/**
 * Compact logo lockup for tight headers/nav: the real t mark beside a
 * stacked "TULSA / TRAINING" rendered in the display font (white).
 */
export function LogoCompact({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}) {
  const sizing =
    size === "sm"
      ? { mark: 22, text: "text-[12px]", gap: "gap-2" }
      : size === "md"
        ? { mark: 32, text: "text-[14px]", gap: "gap-2" }
        : size === "lg"
          ? { mark: 48, text: "text-xl", gap: "gap-2.5" }
          : { mark: 64, text: "text-3xl", gap: "gap-3" };
  return (
    <div
      className={cx(
        "inline-flex items-center leading-none",
        sizing.gap,
        className,
      )}
    >
      <TTMark size={sizing.mark} priority />
      <div className="flex flex-col leading-[0.92]">
        <span
          className={cx(
            "display font-bold tracking-tight text-ink",
            sizing.text,
          )}
        >
          TULSA
        </span>
        <span
          className={cx(
            "display font-bold tracking-tight text-ink-muted",
            sizing.text,
          )}
        >
          TRAINING
        </span>
      </div>
    </div>
  );
}
