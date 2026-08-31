"use client";

import { useT } from "@/i18n";

/**
 * The one-time "I'm an AI" disclosure. Shown early, dismissed once, never
 * repeated per message (hard constraint).
 */
export function Disclosure({ onDismiss }: { onDismiss: () => void }) {
  const t = useT();
  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-brand/15 bg-brand/[0.06] p-4">
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 shrink-0 text-brand"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      <div>
        <p className="text-sm leading-relaxed text-ink">
          {t("talk.disclosure.body")}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2.5 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {t("talk.disclosure.dismiss")}
        </button>
      </div>
    </div>
  );
}
