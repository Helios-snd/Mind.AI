"use client";

import Link from "next/link";
import { isKey, useI18n } from "@/i18n";
import { EscalationInterstitial } from "@/components/EscalationInterstitial";
import { useEscalation, useEscalationHistory, useRequestSupport } from "@/api/hooks";

export default function HumanPage() {
  const { t, language } = useI18n();
  const escalation = useEscalation();
  const history = useEscalationHistory();
  const request = useRequestSupport();

  const pending = escalation.data ?? null;
  const recent = (history.data ?? []).slice(0, 3);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  return (
    <div className="container-x max-w-xl py-12 pb-28">
      <Link href="/me" className="text-sm font-semibold text-brand">
        ← {t("human.back")}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
        {t("human.heading")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {t("human.body")}
      </p>

      <div className="mt-8 space-y-4">
        <a
          href="tel:14416"
          className="support-panel block transition hover:-translate-y-0.5 hover:border-crisis/30"
        >
          <p className="font-semibold text-gray-900">
            {t("human.telemanas.title")}
          </p>
          <p className="mt-0.5 text-sm text-gray-600">
            {t("human.telemanas.body")}
          </p>
        </a>

        {/* Campus counsellor: a pending offer (Trend-fired or a manual ask,
            wherever it started) shows the exact same interstitial /talk
            already renders. Otherwise, a real "Request support" action --
            reusing the same pending -> approve lifecycle, not a shortcut
            around it. See F3 plan: the AskUserQuestion decision was to keep
            this gated behind an explicit Approve, same as every other
            escalation. */}
        {escalation.isPending ? (
          <p className="text-sm text-gray-500">{t("state.loading")}</p>
        ) : pending ? (
          <EscalationInterstitial />
        ) : (
          <div className="surface-card">
            <p className="font-semibold text-gray-900">
              {t("human.counsellor.title")}
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
              {t("human.request.intro")}
            </p>
            <button
              type="button"
              onClick={() => request.mutate()}
              disabled={request.isPending}
              className="btn-primary mt-4"
            >
              {t("human.request.button")}
            </button>
          </div>
        )}

        {/* Recent activity -- reuses F2's GET /escalations/history verbatim.
            Hidden entirely when empty: /human is the lean, actionable
            surface, not the exhaustive one -- that's /data's job. */}
        {recent.length > 0 && (
          <div className="surface-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {t("human.recent.title")}
            </p>
            <ul className="mt-3 divide-y divide-gray-100">
              {recent.map((item, index) => {
                const statusKey = `data.escalations.status.${item.status}`;
                const statusLabel = isKey(statusKey) ? t(statusKey) : item.status;
                const reasonLabel = isKey(item.reasonSummaryKey)
                  ? t(item.reasonSummaryKey)
                  : null;
                return (
                  <li key={`${item.createdAt}-${index}`} className="py-3 text-sm">
                    <p className="font-semibold text-gray-900">{statusLabel}</p>
                    {reasonLabel && (
                      <p className="mt-0.5 text-gray-600">{reasonLabel}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-400">
                      {fmtDate(item.createdAt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
