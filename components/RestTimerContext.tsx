"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { RestTimer } from "./RestTimer";

type StartFn = (seconds: number, label?: string) => void;

const RestTimerCtx = createContext<{ start: StartFn }>({ start: () => {} });

/**
 * Wraps a workout view, exposes `useRestTimer().start(seconds, label)` to
 * any descendant. Renders a single sticky timer at the bottom.
 * Default rest = 90 sec if the caller passes nothing usable.
 */
export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<{
    seconds: number;
    label?: string;
    key: number;
  } | null>(null);

  const start: StartFn = (seconds, label) => {
    const safe = Math.max(5, Math.min(600, Math.round(seconds || 90)));
    // Bumping `key` re-mounts the timer so it restarts cleanly on rapid taps.
    setActive({ seconds: safe, label, key: Date.now() });
  };

  return (
    <RestTimerCtx.Provider value={{ start }}>
      {children}
      {active && (
        <RestTimer
          key={active.key}
          seconds={active.seconds}
          label={active.label}
          onDone={() => setActive(null)}
        />
      )}
    </RestTimerCtx.Provider>
  );
}

export function useRestTimer() {
  return useContext(RestTimerCtx);
}
