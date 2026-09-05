"use client";

import { useI18n } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { SeriesId, TrendSeries } from "@/api/types";
import { SERIES_LABEL_KEYS } from "./SeriesCard";

const DIRECTION_KEYS: Record<string, Keys> = {
  rising: "trends.dir.rising",
  declining: "trends.dir.declining",
  steady: "trends.dir.steady",
};

const ARROW: Record<string, string> = {
  rising: "↑",
  declining: "↓",
  steady: "→",
};

/**
 * The four headline numbers, from the selected range.
 *
 * "improving" is deliberately reserved for the direction, never applied to the
 * person. Sleep rising is not automatically good and mood falling is not a
 * verdict — the arrow describes the line, and the copy stays that modest.
 */
export function MetricStrip({ series }: { series: TrendSeries[] }) {
  const { t, n } = useI18n();

  const plotted = series.filter((s) => s.points.length > 0);
  if (plotted.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {plotted.map((s, index) => (
        <div
          key={s.id}
          className="animate-fade-up rounded-2xl border border-brand/10 bg-cream-alt/80 p-4 shadow-soft"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-earth">
            {t(SERIES_LABEL_KEYS[s.id as SeriesId])}
          </p>
          <p className="mt-1.5 font-display text-2xl text-ink">
            {s.average === null
              ? "—"
              : s.id === "sleep"
                ? t("trends.metric.hrs", { value: n(s.average) })
                : t("trends.metric.of5", { value: n(s.average) })}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand">
            {s.direction ? (
              <>
                <span aria-hidden="true">{ARROW[s.direction]}</span>{" "}
                {t(DIRECTION_KEYS[s.direction])}
              </>
            ) : (
              <span className="text-earth">{t("trends.dir.unknown")}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
