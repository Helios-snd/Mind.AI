"use client";

import { useT } from "@/i18n";

/**
 * The one-time "I'm an AI" disclosure. Shown early, dismissed once, never
 * repeated per message (hard constraint).
 */
export function Disclosure({ onDismiss }: { onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-cream p-4">
      <p className="text-sm leading-relaxed text-gray-700">
        {t("talk.disclosure.body")}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-sm font-semibold text-brand"
      >
        {t("talk.disclosure.dismiss")}
      </button>
    </div>
  );
}
