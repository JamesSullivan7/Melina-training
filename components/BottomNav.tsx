"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Activity,
  HeartPulse,
  TrendingUp,
} from "lucide-react";
import { cx } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/program", label: "Program", icon: CalendarDays },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/recovery", label: "Recovery", icon: HeartPulse },
  { href: "/history", label: "History", icon: Activity },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-bg-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto max-w-screen-md grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cx(
                "relative flex flex-col items-center justify-center gap-1 py-1.5 tap rounded-lg",
                active ? "text-brand" : "text-ink-muted hover:text-ink",
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 bg-brand rounded-full" />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span
                className={cx(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  active && "text-brand",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
