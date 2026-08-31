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
    <div className="animate-fade-up space-y-6">
      <div role="status" className="space-y-2">
        <p className="font-display text-xl leading-relaxed text-ink">
          {t(reflection.ackKey)}
        </p>
        {hadNote && (
          <p className="text-sm text-earth">{t("today.ack.noted")}</p>
        )}
      </div>

      {reflection.suggestion && (
        <div className="card p-5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("today.suggest.label")}
          </p>
          <p className="mt-2.5 font-display text-base font-semibold text-ink">
            {t(reflection.suggestion.titleKey)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-earth">
            {t(reflection.suggestion.bodyKey)}
          </p>
        </div>
      )}

      {onAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          className="text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {t("today.done.addMore")}
        </button>
      )}
    </div>
  );
}
