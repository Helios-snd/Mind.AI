"use client";

import { isKey, useT } from "@/i18n";
import type { Reflection } from "@/api/types";

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

  // The reflection comes from the server, so its keys are plain strings until
  // checked. An unknown key means the dictionaries have drifted across a
  // deploy; render nothing rather than a raw key like "today.ack.exam".
  const ack = isKey(reflection.ackKey) ? t(reflection.ackKey) : null;
  const suggestion = reflection.suggestion;
  const title =
    suggestion && isKey(suggestion.titleKey) ? t(suggestion.titleKey) : null;
  const body =
    suggestion && isKey(suggestion.bodyKey) ? t(suggestion.bodyKey) : null;

  return (
    <div className="animate-fade-up space-y-6">
      <div role="status" className="space-y-2">
        {ack && (
          <p className="font-display text-xl leading-relaxed text-ink">{ack}</p>
        )}
        {hadNote && (
          <p className="text-sm text-earth">{t("today.ack.noted")}</p>
        )}
      </div>

      {title && body && (
        <div className="card p-5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {t("today.suggest.label")}
          </p>
          <p className="mt-2.5 font-display text-base font-semibold text-ink">
            {title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-earth">{body}</p>
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
