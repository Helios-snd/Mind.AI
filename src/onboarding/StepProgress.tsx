"use client";

import { useI18n } from "@/i18n";
import type { OnboardingStep } from "@/api/types";

const TOTAL = 5;

/**
 * Position across the onboarding flow.
 *
 * Deliberately quiet: a thin segmented rule, no numerals in the visual, no
 * percentage. The flow already asks a lot of someone who may not be having a
 * good day, and a loud progress meter reads as a demand. The count is exposed
 * to assistive technology through the label rather than drawn on screen.
 */
export default function StepProgress({ step }: { step: OnboardingStep }) {
  const { t, n } = useI18n();
  const label = t("onboarding.progress.label", {
    current: n(step),
    total: n(TOTAL),
  });

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={TOTAL}
      aria-valuenow={step}
      aria-valuetext={label}
      aria-label={label}
      className="mb-10 flex gap-1.5"
    >
      {Array.from({ length: TOTAL }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            index < step ? "bg-brand" : "bg-ink/[0.08]"
          }`}
        />
      ))}
    </div>
  );
}
