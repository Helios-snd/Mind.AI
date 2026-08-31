"use client";

import { useId, useState } from "react";
import { useT } from "@/i18n";

export default function StepConsent({
  onBack,
  onAgree,
  busy,
}: {
  onBack: () => void;
  onAgree: () => void;
  busy: boolean;
}) {
  const t = useT();
  const checkboxId = useId();
  const [checked, setChecked] = useState(false);

  return (
    <section>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("onboarding.consent.heading")}
      </h1>

      <ul className="mt-6 space-y-3 text-gray-700">
        <li>{t("onboarding.consent.line.stored")}</li>
        <li>{t("onboarding.consent.line.readDelete")}</li>
        <li>{t("onboarding.consent.line.ai")}</li>
        <li>
          <strong>{t("onboarding.consent.line.college")}</strong>
        </li>
      </ul>

      <details className="mt-6 rounded-xl border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-800">
          {t("onboarding.consent.disclosure.summary")}
        </summary>
        <p className="mt-3 text-sm text-gray-600">
          {t("onboarding.consent.disclosure.body")}
        </p>
      </details>

      <div className="mt-6 flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1"
        />
        <label htmlFor={checkboxId} className="text-gray-800">
          {t("onboarding.consent.checkbox")}
        </label>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-brand"
        >
          {t("action.back")}
        </button>
        <button
          type="button"
          disabled={!checked || busy}
          onClick={onAgree}
          className="btn-primary"
        >
          {t("action.continue")}
        </button>
      </div>
    </section>
  );
}
