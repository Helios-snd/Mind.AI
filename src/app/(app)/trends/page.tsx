"use client";

import { useState } from "react";
import Link from "next/link";
import { isKey, useI18n } from "@/i18n";
import { useTrends } from "@/api/hooks";
import type { Keys } from "@/i18n/en";
import type { TrendRange, Trends } from "@/api/types";
import { SeriesCard } from "./SeriesCard";
import { MetricStrip } from "./MetricStrip";
import { CheckinSnapshot } from "./CheckinSnapshot";
import { StartingPoint } from "./StartingPoint";

const RANGES: { id: TrendRange; labelKey: Keys }[] = [
  { id: "7d", labelKey: "trends.range.7d" },
  { id: "4w", labelKey: "trends.range.4w" },
  { id: "6w", labelKey: "trends.range.6w" },
];

/** 4w and 6w arrive as Monday buckets, which are contiguous by construction. */
const WEEKLY: TrendRange[] = ["4w", "6w"];

export default function TrendsPage() {
  const { t } = useI18n();
  const [range, setRange] = useState<TrendRange>("4w");
  const trends = useTrends(range);

  return (
    <div className="container-x max-w-2xl pt-8 pb-28 sm:pt-12">
      <header className="animate-fade-up">
        <h1 className="h-display text-[28px] leading-tight sm:text-[32px]">
          {t("trends.dash.heading")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-earth">
          {t("trends.dash.sub")}
        </p>
      </header>

      <div
        role="tablist"
        aria-label={t("trends.rangeLabel")}
        className="mt-6 flex gap-1.5 rounded-2xl border border-ink/[0.06] bg-cream-alt/70 p-1 shadow-soft"
      >
        {RANGES.map((option) => {
          const selected = option.id === range;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setRange(option.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-brand text-white shadow-soft"
                  : "text-earth hover:text-ink"
              }`}
            >
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>

      {trends.isPending && (
        <p role="status" className="mt-10 text-earth">
          {t("state.loading")}
        </p>
      )}

      {/* No fixture fallback. If the server cannot be reached the student is
          told, rather than shown a chart of data that does not exist. */}
      {trends.isError && (
        <div role="alert" className="mt-10">
          <p className="text-earth">{t("state.error")}</p>
          <button
            type="button"
            className="btn-outline mt-4"
            onClick={() => trends.refetch()}
          >
            {t("action.retry")}
          </button>
        </div>
      )}

      {trends.data && <Body data={trends.data} range={range} />}
    </div>
  );
}

/**
 * The three states in order: nothing logged, some logged but not enough for
 * a trend read, enough for the full dashboard. `checkInCount` is total
 * history; `hasEnoughData` is scoped to the selected window -- a student with
 * plenty of history can still land in the partial tier on a 7-day view if
 * this week has been thin, and that is the correct read for that window.
 */
function Body({ data, range }: { data: Trends; range: TrendRange }) {
  if (data.checkInCount === 0) return <EmptyState />;
  if (!data.hasEnoughData) return <PartialDashboard data={data} />;
  return <FullDashboard data={data} range={range} />;
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="mt-10 animate-fade-up rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/[0.07] to-transparent p-8 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-brand"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path d="M4 19V5M4 19h16M8 15l3.5-4 3 2.5L20 8" />
        </svg>
      </div>
      <p className="mt-5 font-display text-xl text-ink">
        {t("trends.empty.title")}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-earth">
        {t("trends.empty.body")}
      </p>
      <Link href="/today" className="btn-primary mt-7 inline-flex">
        {t("trends.empty.cta")}
      </Link>
    </div>
  );
}

/**
 * 1-2 check-ins: real numbers, no trend claims. Every series still shows
 * whatever points and average it has (the backend withholds baseline,
 * direction and change until MIN_POINTS_FOR_CHART), so this reuses the same
 * SeriesCard as the full dashboard rather than a separate stripped-down view.
 */
function PartialDashboard({ data }: { data: Trends }) {
  const { t } = useI18n();
  const plotted = data.series.filter((s) => s.points.length > 0);

  return (
    <div className="mt-8 space-y-6">
      <MetricStrip series={data.series} />

      <p className="rounded-xl border border-brand/15 bg-brand/[0.05] px-4 py-3 text-sm text-earth">
        {t("trends.state.thin")}
      </p>

      {data.startingPoint && (
        <StartingPoint start={data.startingPoint} series={data.series} />
      )}

      {plotted.length > 0 && (
        <div className="space-y-5">
          {plotted.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              referenceValue={data.startingPoint?.firstValues[series.id] ?? null}
            />
          ))}
        </div>
      )}

      <CheckinSnapshot rhythm={data.rhythm} secondary={data.secondary} />
    </div>
  );
}

function FullDashboard({ data, range }: { data: Trends; range: TrendRange }) {
  const { t } = useI18n();
  const weekly = WEEKLY.includes(range);

  const insights = data.summary.insightKeys.filter(isKey).map((key) => t(key));
  const tip =
    data.summary.tipKey && isKey(data.summary.tipKey)
      ? t(data.summary.tipKey)
      : null;

  const byId = Object.fromEntries(data.series.map((s) => [s.id, s]));

  return (
    <div className="mt-8 space-y-6">
      <MetricStrip series={data.series} />

      {data.startingPoint && (
        <StartingPoint start={data.startingPoint} series={data.series} />
      )}

      <section className="rounded-2xl border border-brand/10 bg-cream-alt/60 p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold text-ink">
          {t("trends.notes.heading")}
        </h2>
        {insights.length > 0 ? (
          <div className="mt-3 space-y-2">
            {insights.map((line) => (
              <p key={line} className="text-sm leading-relaxed text-ink">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-earth">{t("trends.notes.tooEarly")}</p>
        )}

        {tip && (
          <div className="mt-4 rounded-xl border border-brand/15 bg-brand/[0.06] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              {t("trends.action.heading")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-earth">{tip}</p>
          </div>
        )}
      </section>

      {/* Split composition: Mood and Social get a full-width panel each;
          Sleep and Energy pair up once there is room, stacking on phones so
          nothing gets cramped under ~640px. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SeriesCard
            series={byId.mood}
            weekly={weekly}
            large
            referenceValue={data.startingPoint?.firstValues.mood ?? null}
          />
        </div>
        <SeriesCard
          series={byId.sleep}
          weekly={weekly}
          referenceValue={data.startingPoint?.firstValues.sleep ?? null}
        />
        <SeriesCard
          series={byId.energy}
          weekly={weekly}
          referenceValue={data.startingPoint?.firstValues.energy ?? null}
        />
        <div className="sm:col-span-2">
          <SeriesCard
            series={byId.social}
            weekly={weekly}
            large
            referenceValue={data.startingPoint?.firstValues.social ?? null}
          />
        </div>
      </div>

      <CheckinSnapshot rhythm={data.rhythm} secondary={data.secondary} />
    </div>
  );
}
