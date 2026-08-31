"use client";

import { useId } from "react";
import { useI18n } from "@/i18n";

const MIN = 0;
const MAX = 12;
const STEP = 0.5;

export function SleepSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (hours: number) => void;
}) {
  const { t, n } = useI18n();
  const id = useId();

  const readout =
    value < 1
      ? t("today.sleep.zero")
      : t("today.sleep.value", {
          hours: value % 1 === 0 ? n(value) : `${n(Math.floor(value))}½`,
        });

  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {t("today.sleep.legend")}
      </label>
      <p
        className="font-display text-xl font-semibold text-ink"
        aria-live="polite"
      >
        {readout}
      </p>
      <input
        id={id}
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={readout}
        className="slider mt-3.5 w-full"
        style={{
          background: `linear-gradient(to right, #56663A ${pct}%, rgba(107,98,80,0.18) ${pct}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-earth/60">
        <span>{n(MIN)}</span>
        <span>{n(MAX)}</span>
      </div>
    </div>
  );
}
