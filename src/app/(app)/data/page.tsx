"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import type { Keys } from "@/i18n/en";
import {
  useCheckIns,
  useDeleteCheckIn,
  useDeleteConversation,
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
