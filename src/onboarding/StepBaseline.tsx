"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { DASS21, DASS21_TOTAL } from "@/content/instruments";
import type { BaselineAnswer } from "@/api/types";

const ADVANCE_DELAY_MS = 250;
const VALUES = [0, 1, 2, 3] as const;
const ANSWER_KEYS = [
  "onboarding.baseline.answer.0",
  "onboarding.baseline.answer.1",
  "onboarding.baseline.answer.2",
  "onboarding.baseline.answer.3",
] as const;

export default function StepBaseline({
  existing,
  onSave,
  onBack,
  onDone,
}: {
  existing: BaselineAnswer[];
  onSave: (answers: BaselineAnswer[]) => Promise<unknown>;
  onBack: () => void;
  onDone: () => void;
}) {
  const { t, n, language } = useI18n();
  const reducedMotion = usePrefersReducedMotion();

  const answers = useMemo(
    () => new Map(existing.map((a) => [a.itemId, a.value])),
    [existing],
  );

  // Resume at the first unanswered item.
  const firstUnanswered = DASS21.findIndex((item) => !answers.has(item.id));
  const [index, setIndex] = useState(
    firstUnanswered === -1 ? DASS21.length - 1 : firstUnanswered,
  );
  const [locked, setLocked] = useState(false);

  const item = DASS21[index];

  const choose = async (value: 0 | 1 | 2 | 3) => {
    if (locked) return;
    setLocked(true);

    const next = new Map(answers);
    next.set(item.id, value);
    const payload: BaselineAnswer[] = Array.from(next, ([itemId, v]) => ({
      itemId,
      value: v,
    }));
    await onSave(payload);

    const advance = () => {
      if (index < DASS21.length - 1) {
        setIndex(index + 1);
        setLocked(false);
      } else {
        onDone();
      }
    };

    if (reducedMotion) advance();
    else window.setTimeout(advance, ADVANCE_DELAY_MS);
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else onBack();
  };

  return (
    <section>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("onboarding.baseline.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {t("onboarding.baseline.subline")}
      </p>

      <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {t("onboarding.baseline.counter", {
          current: n(index + 1),
          total: n(DASS21_TOTAL),
        })}
      </p>

      <p className="mt-2 text-lg text-gray-900">
        {language === "bn" ? item.bn : item.en}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {VALUES.map((value) => (
          <button
            key={value}
            type="button"
            disabled={locked}
            onClick={() => choose(value)}
            aria-pressed={answers.get(item.id) === value}
            className="btn-outline justify-start py-3 text-base"
          >
            {t(ANSWER_KEYS[value])}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={back}
        className="mt-8 text-sm font-semibold text-brand"
      >
        {t("action.back")}
      </button>
    </section>
  );
}
