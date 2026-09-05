"use client";

import { useT } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { MoodValue } from "./storage";
import { Scale5 } from "./Scale5";

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

  return (
    <Scale5
      value={value}
      onChange={onChange}
      groupLabel={t("today.mood.legend")}
      labelFor={(mood) => t(LABEL_KEYS[mood])}
      renderIcon={(mood, selected) => (
        <Face
          mood={mood}
          className={`h-8 w-8 transition-transform duration-200 ${
            selected ? "scale-110" : ""
          }`}
        />
      )}
    />
  );
}
