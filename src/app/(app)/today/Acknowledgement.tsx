"use client";

import { useT } from "@/i18n";
import type { Reflection } from "./reflect";

export function Acknowledgement({
  reflection,
  hadNote,
  onAddMore,
}: {
  reflection: Reflection;
  hadNote: boolean;
  onAddMore?: () => void;
}) {
  const t = useT();

  return (
    <div className="space-y-6">
      <div role="status" className="space-y-2">
        <p className="font-display text-xl leading-relaxed text-gray-900">
          {t(reflection.ackKey)}
        </p>
        {hadNote && <p className="text-gray-600">{t("today.ack.noted")}</p>}
      </div>

      {reflection.suggestion && (
        <div className="rounded-2xl border border-gray-200 bg-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t("today.suggest.label")}
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {t(reflection.suggestion.titleKey)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {t(reflection.suggestion.bodyKey)}
          </p>
        </div>
      )}

      {onAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          className="text-sm font-semibold text-brand"
        >
          {t("today.done.addMore")}
        </button>
      )}
    </div>
  );
}
