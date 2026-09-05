"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Counts from zero to `target` once, for the result reveal.
 *
 * Under prefers-reduced-motion it jumps straight to the value: a number
 * animating on a mental-health result screen is decoration, and decoration is
 * the first thing to drop when someone has asked for less movement.
 */
export function useCountUp(target: number | null, durationMs = 900): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // Ease-out, so it settles rather than stopping dead on the number.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reduced]);

  return value;
}
