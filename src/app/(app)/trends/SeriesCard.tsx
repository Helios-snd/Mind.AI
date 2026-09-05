"use client";

import { isKey, useI18n } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { SeriesId, TrendSeries } from "@/api/types";
import { SeriesChart } from "./SeriesChart";

/** Scale bounds per series. Sleep is hours; the rest are the 1–5 answers. */
const BOUNDS: Record<SeriesId, { min: number; max: number }> = {
  mood: { min: 1, max: 5 },
  sleep: { min: 0, max: 12 },
  energy: { min: 1, max: 5 },
  social: { min: 1, max: 5 },
};

const LABEL_KEYS: Record<SeriesId, Keys> = {
  mood: "trends.series.mood",
  sleep: "trends.series.sleep",
  energy: "trends.series.energy",
  social: "trends.series.social",
};

/**
 * One primary series: chart, the number row underneath it, and a baseline
 * comparison when there is enough history for one.
 *
 * `large` widens the heading and gives the chart more vertical room — used
 * for the two full-width panels (Mood, Social) in the page's split layout.
 * The SVG itself is viewBox-scaled either way, so nothing here changes how
 * the chart draws; it only changes how much space it's given.
 *
 * `referenceValue` is the student's own earliest-week average for this
 * series (from Trends.startingPoint.firstValues) — a reference, never a
 * plotted data point, and only ever present once there is a genuine gap
 * between "then" and "now" (see the backend's FIRST_WINDOW_DAYS gating).
 */
export function SeriesCard({
  series,
  weekly = false,
  large = false,
  referenceValue = null,
}: {
  series: TrendSeries;
  weekly?: boolean;
  large?: boolean;
  referenceValue?: number | null;
}) {
  const { t, n } = useI18n();
  const name = t(LABEL_KEYS[series.id]);
  const bounds = BOUNDS[series.id];

  const fmt = (value: number) =>
    series.id === "sleep"
      ? t("trends.metric.hrs", { value: n(Math.round(value * 10) / 10) })
      : t("trends.metric.of5", { value: n(Math.round(value * 10) / 10) });

  // Bare numbers on the axis -- the chart is already labelled "Sleep" /
  // "Mood" above it, so "/5" and "hrs" would just repeat what the heading
  // already says.
  const axisFmt = (value: number) => n(value);

  // Observation and tip keys come from the server, so they are plain strings
  // until checked against the dictionary.
  const observation =
    series.observationKey && isKey(series.observationKey)
      ? t(series.observationKey, { series: name.toLowerCase() })
      : null;
  const tip = series.tipKey && isKey(series.tipKey) ? t(series.tipKey) : null;

  const chartLabel = `${name} — ${observation ?? ""}`.trim();

  return (
    <section
      className={`card ${large ? "p-5 sm:p-6" : "p-5"}`}
      aria-labelledby={`series-${series.id}-heading`}
    >
      <h2
        id={`series-${series.id}-heading`}
        className={`font-display font-semibold text-ink ${large ? "text-lg" : "text-base"}`}
      >
        {name}
      </h2>

      {series.points.length === 0 ? (
        <p className="mt-3 text-sm text-earth">{t("trends.notEnoughSeries")}</p>
      ) : series.points.length === 1 ? (
        <>
          <SinglePointSnapshot
            point={series.points[0]}
            fmt={fmt}
            referenceValue={referenceValue}
          />
          <StatRow series={series} fmt={fmt} />
        </>
      ) : (
        <>
          <div className="mt-3">
            <SeriesChart
              points={series.points}
              baseline={series.baseline}
              min={bounds.min}
              max={bounds.max}
              label={chartLabel}
              weekly={weekly}
              formatValue={axisFmt}
              // 2 points still describe real data, but not a series worth the
              // full chart's vertical reach -- see SinglePointSnapshot above
              // for the 1-point case and SeriesChart's own H_COMPACT comment.
              compact={series.points.length === 2}
              referenceValue={referenceValue}
              referenceLabel={t("trends.start.then")}
            />
          </div>

          <StatRow series={series} fmt={fmt} />

          <BaselineComparison series={series} fmt={fmt} />

          {observation && (
            <p className="mt-3 text-sm leading-relaxed text-ink">{observation}</p>
          )}

          {tip && (
            <div className="mt-4 rounded-xl border border-brand/15 bg-brand/[0.06] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
                {t("trends.tipLabel")}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-earth">{tip}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Exactly one check-in for this series. No axis, no domain, no line -- a
 * single dot centred in a full-scale chart reads as broken, not sparse, so
 * this shows the value plainly instead and says outright that it is early.
 */
function SinglePointSnapshot({
  point,
  fmt,
  referenceValue,
}: {
  point: { at: string; value: number };
  fmt: (value: number) => string;
  referenceValue: number | null;
}) {
  const { t, language } = useI18n();

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  return (
    <div className="mt-3 rounded-xl bg-cream/60 py-6 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
        <span className="font-display text-2xl text-ink">{fmt(point.value)}</span>
      </div>
      <p className="mt-1 text-xs text-earth">{fmtDate(point.at)}</p>

      <p className="mt-3 text-xs text-earth/80">{t("trends.single.early")}</p>

      {referenceValue !== null && (
        <p className="mt-1 text-xs text-earth/80">
          {t("trends.single.reference", { value: fmt(referenceValue) })}
        </p>
      )}
    </div>
  );
}

export { LABEL_KEYS as SERIES_LABEL_KEYS };

/**
 * The number row under every chart: average, highest, lowest, change against
 * the previous window. Lets the student read the data without the chart --
 * three of these four (everything but change) are available even in the
 * partial 1-2 check-in tier, since they describe what was reported rather
 * than implying a trend.
 */
function StatRow({
  series,
  fmt,
}: {
  series: TrendSeries;
  fmt: (value: number) => string;
}) {
  const { t, n } = useI18n();

  if (series.average === null) return null;

  const changeValue = () => {
    if (series.change === null) return t("trends.stat.dash");
    const rounded = Math.round(series.change * 10) / 10;
    if (Math.abs(rounded) < 0.05) return t("trends.stat.changeFlat");
    const sign = rounded > 0 ? "+" : "−";
    return `${sign}${n(Math.abs(rounded))}`;
  };

  return (
    <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-ink/[0.06] pt-4">
      <Stat label={t("trends.stat.average")} value={fmt(series.average)} />
      <Stat
        label={t("trends.stat.highest")}
        value={series.high !== null ? fmt(series.high) : t("trends.stat.dash")}
      />
      <Stat
        label={t("trends.stat.lowest")}
        value={series.low !== null ? fmt(series.low) : t("trends.stat.dash")}
      />
      <Stat label={t("trends.stat.change")} value={changeValue()} />
    </dl>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-earth/70">
        {label}
      </dt>
      <dd className="mt-0.5 truncate font-display text-[15px] text-ink">
        {value}
      </dd>
    </div>
  );
}

/**
 * Recent average against the student's own usual range.
 *
 * The band is theirs alone — there is no population norm anywhere in this
 * product — so the language stays comparative and never evaluative: "below
 * your usual", not "poor" or "unhealthy". Below the baseline threshold this
 * renders nothing (StatRow already showed the average), rather than a
 * duplicate "no baseline yet" note.
 */
function BaselineComparison({
  series,
  fmt,
}: {
  series: TrendSeries;
  fmt: (value: number) => string;
}) {
  const { t, n } = useI18n();

  if (series.average === null || !series.baseline) return null;

  const mid = (series.baseline.low + series.baseline.high) / 2;
  const delta = Math.round((series.average - mid) * 10) / 10;
  const magnitude = Math.abs(delta);

  const verdict =
    series.relation === "above"
      ? t("trends.compare.above", { value: n(magnitude) })
      : series.relation === "below"
        ? t("trends.compare.below", { value: n(magnitude) })
        : t("trends.compare.around");

  return (
    <div className="mt-3 rounded-xl bg-cream/60 p-3.5">
      <dl className="flex items-baseline justify-between">
        <dt className="text-sm text-earth">{t("trends.compare.baseline")}</dt>
        <dd className="text-sm font-semibold text-earth">
          {t("trends.usualRange", {
            low: n(series.baseline.low),
            high: n(series.baseline.high),
          })}
        </dd>
      </dl>
      <p className="mt-2 border-t border-ink/[0.06] pt-2 text-sm font-semibold text-brand">
        {verdict}
      </p>
    </div>
  );
}
