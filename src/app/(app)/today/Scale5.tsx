"use client";

import type { ReactNode } from "react";
import type { ScaleValue } from "./storage";

const VALUES: ScaleValue[] = [1, 2, 3, 4, 5];

/**
 * The 1–5 radiogroup behind the mood, energy and social controls.
 *
 * Extracted from MoodScale so the three scales share one set of keyboard and
 * ARIA semantics rather than becoming three near-copies that drift apart.
 * Everything visual stays with the caller via renderIcon.
 */
export function Scale5({
  value,
  onChange,
  groupLabel,
  labelFor,
  renderIcon,
}: {
  value: ScaleValue | null;
  onChange: (next: ScaleValue) => void;
  groupLabel: string;
  labelFor: (value: ScaleValue) => string;
  renderIcon: (value: ScaleValue, selected: boolean) => ReactNode;
}) {
  const onKeyDown = (event: React.KeyboardEvent) => {
    // With nothing chosen, arrows start from the middle.
    const current = value ?? 3;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, current + 1) as ScaleValue);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, current - 1) as ScaleValue);
    }
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={groupLabel}
        onKeyDown={onKeyDown}
        className="flex items-stretch gap-2"
      >
        {VALUES.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={labelFor(option)}
              // Roving tabindex: the group is one tab stop.
              tabIndex={selected || (value === null && option === 3) ? 0 : -1}
              onClick={() => onChange(option)}
              className={`flex flex-1 items-center justify-center rounded-2xl py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 ${
                selected
                  ? "bg-brand text-white shadow-soft"
                  : "bg-cream-alt/60 text-earth/40 hover:bg-cream-alt hover:text-earth"
              }`}
            >
              {renderIcon(option, selected)}
            </button>
          );
        })}
      </div>
      <p
        className="mt-2.5 h-4 text-center text-xs font-semibold text-earth"
        aria-live="polite"
      >
        {value ? labelFor(value) : ""}
      </p>
    </div>
  );
}
