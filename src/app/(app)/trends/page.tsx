"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { AppHeader } from "@/components/AppHeader";
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
    <div className="container-x max-w-xl pt-8 pb-28 sm:pt-12">
      <AppHeader title={t("trends.heading")} subtitle={t("trends.sub")} />

      {!ready ? (
        <p role="status" className="mt-10 text-earth">
          {t("state.loading")}
        </p>
      ) : !trends ? (
        <div className="card mt-10 animate-fade-up p-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-brand"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4v15a1 1 0 0 0 1 1h15" />
              <path d="M8 14l3-3 3 2 4-5" />
            </svg>
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-ink">
            {t("trends.empty.title")}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-earth">
            {t("trends.empty.body")}
          </p>
        </div>
      ) : (
        <div className="mt-7 animate-fade-up space-y-6">
          <div className="card p-4 sm:p-5">
            <TrendChart weeks={trends.weeks} />
          </div>

          <section className="rounded-2xl border border-brand/15 bg-brand/[0.06] p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              {t("trends.insightLabel")}
            </h2>
            <p className="mt-2 font-display text-lg leading-relaxed text-ink">
              {t(trends.insightKey)}
            </p>
          </section>

          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-earth/70">
              {t("trends.patternsLabel")}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {trends.patternKeys.map((key) => (
                <li
                  key={key}
                  className="flex gap-3 text-sm leading-relaxed text-ink"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60"
                  />
                  {t(key)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <div className="mt-10 border-t border-ink/[0.06] pt-6">
        <Link
          href="/data"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
        >
          {t("trends.stored.link")}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
