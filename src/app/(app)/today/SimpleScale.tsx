"use client";

import { useT } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { ScaleValue } from "./storage";
import { Scale5 } from "./Scale5";

/**
 * Energy and social contact. Same 1–5 frame as mood, rendered as a rising bar
 * rather than a face so the three controls stay visually distinct in a column.
 */
function Bars({ level, className }: { level: ScaleValue; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => {
        const height = 3.5 + index * 3.6;
        return (
          <rect
            key={index}
            x={2.2 + index * 4.2}
            y={20 - height}
            width="2.8"
            height={height}
            rx="1.2"
            fill="currentColor"
            opacity={index < level ? 1 : 0.22}
          />
        );
      })}
    </svg>
  );
}

export function SimpleScale({
  value,
  onChange,
  legendKey,
  labelKeys,
}: {
  value: ScaleValue | null;
  onChange: (next: ScaleValue) => void;
  legendKey: Keys;
  labelKeys: Record<ScaleValue, Keys>;
}) {
  const t = useT();

  return (
    <Scale5
      value={value}
      onChange={onChange}
      groupLabel={t(legendKey)}
      labelFor={(level) => t(labelKeys[level])}
      renderIcon={(level, selected) => (
        <Bars
          level={level}
          className={`h-8 w-8 transition-transform duration-200 ${
            selected ? "scale-110" : ""
          }`}
        />
      )}
    />
  );
}

export const ENERGY_LABELS: Record<ScaleValue, Keys> = {
  1: "today.energy.1",
  2: "today.energy.2",
  3: "today.energy.3",
  4: "today.energy.4",
  5: "today.energy.5",
};

export const SOCIAL_LABELS: Record<ScaleValue, Keys> = {
  1: "today.social.1",
  2: "today.social.2",
  3: "today.social.3",
  4: "today.social.4",
  5: "today.social.5",
};

export const APPETITE_LABELS: Record<ScaleValue, Keys> = {
  1: "today.appetite.1",
  2: "today.appetite.2",
  3: "today.appetite.3",
  4: "today.appetite.4",
  5: "today.appetite.5",
};

export const ACTIVITY_LABELS: Record<ScaleValue, Keys> = {
  1: "today.activity.1",
  2: "today.activity.2",
  3: "today.activity.3",
  4: "today.activity.4",
  5: "today.activity.5",
};
