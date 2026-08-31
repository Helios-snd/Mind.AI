"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { TrendChart } from "./TrendChart";
import { buildTrends, hasEnoughData, type Trends } from "./data";

export default function TrendsPage() {
  const t = useT();
  const router = useRouter();
  const progress = useOnboardingProgress();

  const [ready, setReady] = useState(false);
  const [enough, setEnough] = useState(false);

  useEffect(() => {
    const demo =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("demo") === "1";
    setEnough(demo || hasEnoughData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (progress.data && !progress.data.completedAt) {
      router.replace("/onboarding");
    }
  }, [progress.data, router]);

  const trends: Trends | null = useMemo(
    () => (ready && enough ? buildTrends() : null),
    [ready, enough],
  );

  return (
    <div className="container-x max-w-xl py-10 pb-28 sm:py-14">
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("trends.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{t("trends.sub")}</p>

      {!ready ? (
        <p role="status" className="mt-10 text-gray-600">
          {t("state.loading")}
        </p>
      ) : !trends ? (
        <div className="mt-12 rounded-2xl bg-cream p-6 text-center">
          <p className="font-display text-lg text-gray-900">
            {t("trends.empty.title")}
          </p>
          <p className="mt-1 text-sm text-gray-600">{t("trends.empty.body")}</p>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <TrendChart weeks={trends.weeks} />
          </div>

          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t("trends.insightLabel")}
            </h2>
            <p className="mt-2 font-display text-lg leading-relaxed text-gray-900">
              {t(trends.insightKey)}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t("trends.patternsLabel")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {trends.patternKeys.map((key) => (
                <li key={key} className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    •
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <div className="mt-10 border-t border-gray-100 pt-6">
        <Link
          href="/data"
          className="text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {t("trends.stored.link")} →
        </Link>
      </div>
    </div>
  );
}
