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

// Mouth path per mood, saddest (1) to happiest (5).
const MOUTHS: Record<MoodValue, string> = {
  1: "M8.5 17.3 Q12 13.4 15.5 17.3",
  2: "M8.5 16.4 Q12 14.6 15.5 16.4",
  3: "M8.6 15.4 H15.4",
  4: "M8.5 14.6 Q12 17 15.5 14.6",
  5: "M8.3 13.7 Q12 18.4 15.7 13.7",
};

function Face({ mood, className }: { mood: MoodValue; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.9" cy="10.4" r="1.2" fill="currentColor" />
      <circle cx="15.1" cy="10.4" r="1.2" fill="currentColor" />
      <path
        d={MOUTHS[mood]}
        stroke="currentColor"
        strokeWidth="1.7"
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
    <div>
      <div
        role="radiogroup"
        aria-label={t("today.mood.legend")}
        onKeyDown={onKeyDown}
        className="flex items-stretch gap-2"
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
              className={`flex flex-1 items-center justify-center rounded-2xl py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 ${
                selected
                  ? "bg-brand text-white shadow-soft"
                  : "bg-cream-alt/60 text-earth/40 hover:bg-cream-alt hover:text-earth"
              }`}
            >
              <Face
                mood={mood}
                className={`h-8 w-8 transition-transform duration-200 ${
                  selected ? "scale-110" : ""
                }`}
              />
            </button>
          );
        })}
      </div>
      <p
        className="mt-2.5 h-4 text-center text-xs font-semibold text-earth"
        aria-live="polite"
      >
        {value ? t(LABEL_KEYS[value]) : ""}
      </p>
    </div>
  );
}
