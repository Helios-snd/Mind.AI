"use client";

import { useT } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { MoodValue } from "./storage";

const MOODS: MoodValue[] = [1, 2, 3, 4, 5];

const LABEL_KEYS: Record<MoodValue, Keys> = {
  1: "today.mood.1",
  2: "today.mood.2",
  3: "today.mood.3",
  4: "today.mood.4",
  5: "today.mood.5",
};

// Mouth path per mood, saddest (1) to happiest (5). Greybox — swap for real art.
const MOUTHS: Record<MoodValue, string> = {
  1: "M8.5 17.5 Q12 13.5 15.5 17.5",
  2: "M8.5 16.5 Q12 14.5 15.5 16.5",
  3: "M8.5 15.5 H15.5",
  4: "M8.5 14.5 Q12 17 15.5 14.5",
  5: "M8.5 13.8 Q12 18.2 15.5 13.8",
};

function Face({ mood, className }: { mood: MoodValue; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10.5" r="1.05" fill="currentColor" />
      <circle cx="15" cy="10.5" r="1.05" fill="currentColor" />
      <path
        d={MOUTHS[mood]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoodScale({
  value,
  onChange,
}: {
  value: MoodValue | null;
  onChange: (mood: MoodValue) => void;
}) {
  const t = useT();

  const onKeyDown = (event: React.KeyboardEvent) => {
    const current = value ?? 3;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, current + 1) as MoodValue);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, current - 1) as MoodValue);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("today.mood.legend")}
      onKeyDown={onKeyDown}
      className="flex items-start justify-between gap-1"
    >
      {MOODS.map((mood) => {
        const selected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t(LABEL_KEYS[mood])}
            tabIndex={selected || (value === null && mood === 3) ? 0 : -1}
            onClick={() => onChange(mood)}
            className={`flex min-h-11 flex-1 flex-col items-center rounded-xl py-2 transition-colors ${
              selected
                ? "bg-cream text-brand"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Face mood={mood} className="h-9 w-9 sm:h-10 sm:w-10" />
          </button>
        );
      })}
    </div>
  );
}
