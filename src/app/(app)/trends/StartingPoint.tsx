"use client";

import { useI18n } from "@/i18n";
import type { SeriesId, TrendSeries, TrendStartingPoint } from "@/api/types";
import { SERIES_LABEL_KEYS } from "./SeriesCard";

/**
 * Where the student began, shown apart from the daily measurements.
 *
 * It carries no DASS-21 score and no severity band. Those exist for the
 * counsellor brief; hard constraint 1 is that the student sees plain language
 * and never a label, so the starting point is a date plus their own earliest
 * averages — their numbers, not an instrument's reading of them.
 */
export function StartingPoint({
  start,
  series,
}: {
  start: TrendStartingPoint;
  series: TrendSeries[];
}) {
  const { t, n, language } = useI18n();

  const since = start.since
    ? new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
        day: "numeric",
        month: "long",
      }).format(new Date(start.since))
    : null;

  const entries = (Object.keys(start.firstValues) as SeriesId[])
    .map((id) => ({
      id,
      then: start.firstValues[id]!,
      now: series.find((s) => s.id === id)?.average ?? null,
    }))
    .filter((entry) => entry.now !== null);

  return (
    <section className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/[0.07] to-transparent p-5">
      <h2 className="font-display text-base font-semibold text-ink">
        {t("trends.start.heading")}
      </h2>
      {since && (
        <p className="mt-1 text-sm text-earth">
          {t("trends.start.sub", { date: since })}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-earth">{t("trends.start.noValues")}</p>
      ) : (
        <dl className="mt-4 space-y-2.5">
          <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-earth">
            <span />
            <span className="flex gap-6">
              <span className="w-10 text-right">{t("trends.start.then")}</span>
              <span className="w-10 text-right">{t("trends.start.now")}</span>
            </span>
          </div>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between border-t border-ink/[0.06] pt-2.5"
            >
              <dt className="text-sm text-earth">
                {t(SERIES_LABEL_KEYS[entry.id])}
              </dt>
              <dd className="flex gap-6 text-sm">
                <span className="w-10 text-right text-earth">
                  {n(entry.then)}
                </span>
                <span className="w-10 text-right font-semibold text-ink">
                  {n(entry.now!)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {start.baselineTaken && (
        <p className="mt-4 text-xs text-earth/80">
          {t("trends.start.baselineTaken")}
        </p>
      )}
    </section>
  );
}
