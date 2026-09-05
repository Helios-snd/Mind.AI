"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import { useTrends } from "@/api/hooks";
import type { Keys } from "@/i18n/en";
import type { SeriesId } from "@/api/types";

// Same keys /trends' own SeriesCard uses — not a second set of labels.
const ROW_LABEL_KEY: Record<SeriesId, Keys> = {
  mood: "trends.series.mood",
  sleep: "trends.series.sleep",
  energy: "trends.series.energy",
  social: "trends.series.social",
};

/**
 * A quick-glance summary on /me. Reuses useTrends -- the exact hook and
 * types the /trends page itself uses -- rather than computing a second set
 * of averages that could drift from the real ones. Links to /trends for
 * the full charts rather than reproducing them here.
 */
export function PatternsSummary() {
  const { t, n } = useI18n();
  const trends = useTrends("4w");

  if (trends.isPending) {
    return <p className="text-sm text-earth">{t("state.loading")}</p>;
  }

  if (trends.isError || !trends.data || trends.data.checkInCount === 0) {
    return <p className="text-sm text-earth">{t("me.patterns.empty")}</p>;
  }

  const { data } = trends;
  const withAverage = data.series.filter((s) => s.average !== null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-earth">
        {t("me.patterns.checkins", { count: n(data.checkInCount) })}
      </p>

      {withAverage.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {withAverage.map((series) => (
            <div key={series.id} className="rounded-xl bg-cream px-3 py-2.5">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-earth/70">
                {t(ROW_LABEL_KEY[series.id])}
              </dt>
              <dd className="mt-0.5 text-base font-semibold text-ink">
                {n(Number(series.average))}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <Link
        href="/trends"
        className="inline-block text-sm font-semibold text-brand hover:text-brand-dark"
      >
        {t("me.patterns.seeTrends")}
      </Link>
    </div>
  );
}
