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

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {t("today.sleep.legend")}
      </label>
      <p className="font-display text-lg text-gray-900" aria-live="polite">
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
        className="mt-3 w-full accent-brand"
      />
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>{n(MIN)}</span>
        <span>{n(MAX)}</span>
      </div>
    </div>
  );
}
