"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6 text-center">
        <div className="max-w-sm space-y-4">
          <div className="tt-label">Setup needed</div>
          <div className="font-display font-black text-3xl leading-tight">
            CONVEX NOT CONFIGURED
          </div>
          <p className="text-sm text-tt-mid leading-relaxed">
            Add <code className="text-tt-white">NEXT_PUBLIC_CONVEX_URL</code> to
            your <code className="text-tt-white">.env.local</code>. Run{" "}
            <code className="text-tt-white">npx convex dev</code> in a separate
            terminal to create your deployment.
          </p>
        </div>
      </div>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
