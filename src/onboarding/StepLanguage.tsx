"use client";

import { useT } from "@/i18n";
import type { Language } from "@/api/types";

export default function StepLanguage({
  onChoose,
  busy,
}: {
  onChoose: (language: Language) => void;
  busy: boolean;
}) {
  const t = useT();

  return (
    <section>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("onboarding.language.heading")}
      </h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => onChoose("en")}
          className="btn-outline flex-1 justify-center py-4 text-base"
        >
          {t("onboarding.language.english")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onChoose("bn")}
          className="btn-outline flex-1 justify-center py-4 text-base"
        >
          {t("onboarding.language.bengali")}
        </button>
      </div>

      <p className="mt-6 text-sm text-gray-600">
        {t("onboarding.language.subline")}
      </p>
    </section>
  );
}
