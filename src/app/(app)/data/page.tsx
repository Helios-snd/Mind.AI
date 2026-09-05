"use client";

import Link from "next/link";
import { isKey, useI18n } from "@/i18n";
import type { Keys } from "@/i18n/en";
import type { ScreeningInstrument } from "@/api/types";
import {
  useCheckIns,
  useDataInventory,
  useDeleteCheckIn,
  useDeleteConversation,
  useEscalationHistory,
  useExportMyData,
  useMeSummary,
  useOnboardingProgress,
  useTalkConversation,
} from "@/api/hooks";

const MOOD_LABEL: Record<number, Keys> = {
  1: "data.mood.1",
  2: "data.mood.2",
  3: "data.mood.3",
  4: "data.mood.4",
  5: "data.mood.5",
};

// Same mapping WellbeingSummary.tsx uses on /me -- duplicated rather than
// imported across route folders for four lines that never change together
// for any reason other than "a new instrument shipped", which touches both
// call sites anyway. dass21 is the onboarding baseline every onboarded
// student has, not just the phq9/gad7/asrs_v1_1 explicit-completion flow.
const INSTRUMENT_LABEL_KEY: Record<ScreeningInstrument, Keys> = {
  phq9: "me.wellbeing.screenings.phq9",
  gad7: "me.wellbeing.screenings.gad7",
  asrs_v1_1: "me.wellbeing.screenings.asrsV11",
  dass21: "me.wellbeing.screenings.dass21",
};

/** Browser-only download, no backend file storage -- a Blob + object URL,
 *  same shape any "export my data" button uses. */
function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function StoredDataPage() {
  const { t, n, language } = useI18n();
  const progress = useOnboardingProgress();

  // Check-ins and the conversation both come from the server now.
  const checkInsQuery = useCheckIns();
  const removeCheckInMutation = useDeleteCheckIn();
  const checkIns = checkInsQuery.data ?? null;

  const conversationQuery = useTalkConversation();
  const removeConversationMutation = useDeleteConversation();
  const thread = conversationQuery.data?.messages ?? null;

  const inventoryQuery = useDataInventory();
  const inventory = inventoryQuery.data ?? null;

  const summaryQuery = useMeSummary();
  const summary = summaryQuery.data ?? null;

  const historyQuery = useEscalationHistory();
  const history = historyQuery.data ?? null;

  const exportMutation = useExportMyData();
  const runExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (data) => {
        const date = new Date().toISOString().slice(0, 10);
        downloadJson(`mind-ai-my-data-${date}.json`, data);
      },
    });
  };

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  const fmtSleep = (hours: number) =>
    hours < 1
      ? t("today.sleep.zero")
      : `${hours % 1 === 0 ? n(hours) : `${n(Math.floor(hours))}½`}h`;

  // Deleting hits the server, so nothing survives locally to reappear later.
  const removeCheckIn = (date: string) => removeCheckInMutation.mutate(date);

  const removeThread = () => removeConversationMutation.mutate();

  const setup = progress.data;

  return (
    <div className="container-x max-w-xl pt-10 pb-28 sm:pt-14">
      <Link href="/trends" className="text-sm font-semibold text-brand">
        ← {t("data.back")}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-gray-900">
        {t("data.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{t("data.intro")}</p>

      {/* Check-ins */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.checkins.title")}
        </h2>
        {checkIns === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : checkIns.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("data.checkins.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {checkIns.map((entry) => (
              <li
                key={entry.at}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {fmtDate(entry.at)}
                  </p>
                  <p className="text-gray-600">
                    {t("data.checkins.summary", {
                      mood: t(MOOD_LABEL[entry.mood]),
                      sleep: fmtSleep(entry.sleepHours),
                    })}
                    {entry.note.trim() ? t("data.checkins.note") : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCheckIn(entry.date)}
                  className="shrink-0 text-xs font-semibold text-crisis"
                >
                  {t("data.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Conversation */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.convo.title")}
        </h2>
        {thread === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : thread.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("data.convo.empty")}</p>
        ) : (
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="text-sm text-gray-600">
              {t("data.convo.count", {
                count: n(thread.length),
                date: fmtDate(thread[0].at),
              })}
            </p>
            <button
              type="button"
              onClick={removeThread}
              className="shrink-0 text-xs font-semibold text-crisis"
            >
              {t("data.convo.delete")}
            </button>
          </div>
        )}
      </section>

      {/* Signals -- a count only. Deleting the check-in or message that
          produced one already cascades it, so there's no per-row delete
          here (see backend/app/modules/users/service.py::get_data_inventory). */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.signals.title")}
        </h2>
        {inventory === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : inventory.signalsCount === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("data.signals.empty")}</p>
        ) : (
          <p className="mt-3 text-sm text-gray-600">
            {t("data.signals.summary", { count: n(inventory.signalsCount) })}
          </p>
        )}
      </section>

      {/* Screenings -- reuses F1's GET /me/summary verbatim, no second
          calculation. Instrument + date only, never a score or band. */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.screenings.title")}
        </h2>
        {summary === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : summary.screenings.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("me.wellbeing.screenings.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {summary.screenings.map((item, index) => (
              <li
                key={`${item.instrument}-${item.completedAt}-${index}`}
                className="py-3 text-sm text-gray-600"
              >
                {t("me.wellbeing.screenings.item", {
                  instrument: t(INSTRUMENT_LABEL_KEY[item.instrument]),
                  date: fmtDate(item.completedAt),
                })}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Safety -- reuses F1's GET /me/summary verbatim. Plain language
          only: never a tier number, never "3a"/"3b", never a severity band. */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.safety.title")}
        </h2>
        {summary === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : (
          <div className="mt-3 text-sm text-gray-600">
            <p>
              {summary.safety.recentFlagCount > 0
                ? t("me.wellbeing.safety.flagged", { count: n(summary.safety.recentFlagCount) })
                : t("me.wellbeing.safety.default")}
            </p>
            {summary.safety.pendingReview && (
              <p className="mt-1.5">{t("me.wellbeing.safety.pendingReview")}</p>
            )}
          </div>
        )}
      </section>

      {/* Escalation history -- past (non-pending) offers of human support.
          Status + the same server-picked reason key the pending interstitial
          uses; never the internal tier or fired_by source. */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.escalations.title")}
        </h2>
        {history === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : history.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("data.escalations.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {history.map((item, index) => {
              const statusKey = `data.escalations.status.${item.status}`;
              const statusLabel = isKey(statusKey) ? t(statusKey) : item.status;
              const reasonLabel = isKey(item.reasonSummaryKey)
                ? t(item.reasonSummaryKey)
                : null;
              return (
                <li
                  key={`${item.createdAt}-${index}`}
                  className="py-3 text-sm"
                >
                  <p className="font-semibold text-gray-900">{statusLabel}</p>
                  {reasonLabel && <p className="mt-0.5 text-gray-600">{reasonLabel}</p>}
                  <p className="mt-0.5 text-xs text-gray-400">{fmtDate(item.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Consent -- the full audit trail, not just the one consentAt already
          shown under Setup below. */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.consent.title")}
        </h2>
        {inventory === null ? (
          <p className="mt-3 text-sm text-gray-500">{t("state.loading")}</p>
        ) : inventory.consentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("data.consent.empty")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {inventory.consentEvents.map((event, index) => {
              const kindKey = `data.consent.kind.${event.kind}`;
              const kindLabel = isKey(kindKey) ? t(kindKey) : event.kind;
              return (
                <li key={`${event.kind}-${event.at}-${index}`} className="py-3 text-sm text-gray-600">
                  {t("data.consent.item", { kind: kindLabel, date: fmtDate(event.at) })}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Setup */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.setup.title")}
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row
            label={t("data.setup.language")}
            value={setup?.language === "bn" ? "বাংলা" : setup?.language === "en" ? "English" : t("data.notSet")}
          />
          <Row
            label={t("data.setup.baseline")}
            value={
              setup?.baseline?.length
                ? t("data.setup.baselineValue", { count: n(setup.baseline.length) })
                : t("data.notSet")
            }
          />
          <Row
            label={t("data.setup.consent")}
            value={setup?.consentAt ? fmtDate(setup.consentAt) : t("data.notSet")}
          />
          <Row
            label={t("data.setup.plan")}
            value={
              setup?.crisisPlan?.whoIdCall
                ? t("data.setup.plan.saved")
                : t("data.setup.plan.none")
            }
          />
          <Row
            label={t("data.setup.contact")}
            value={setup?.contact?.name ?? t("data.setup.contact.none")}
          />
        </dl>
        <p className="mt-3 text-xs text-gray-400">{t("data.setup.editHint")}</p>
      </section>

      {/* Export -- a real, backend-assembled copy of everything above (and
          the full conversation/check-in text, never redacted here either --
          see backend/app/modules/users/service.py::get_export). No frontend
          reconstruction: whatever the file contains is exactly what the
          server sent back. */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {t("data.export.title")}
        </h2>
        <p className="mt-3 text-sm text-gray-600">{t("data.export.body")}</p>
        <button
          type="button"
          onClick={runExport}
          disabled={exportMutation.isPending}
          className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {exportMutation.isPending ? t("data.export.working") : t("data.export.button")}
        </button>
        {exportMutation.isError && (
          <p className="mt-2 text-xs text-crisis">{t("data.export.error")}</p>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
