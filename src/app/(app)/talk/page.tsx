"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { CrisisScreen } from "./CrisisScreen";
import { Disclosure } from "./Disclosure";
import { EscalationInterstitial } from "./EscalationInterstitial";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { useTalkThread } from "./useTalkThread";
import { disclosureSeen, markDisclosureSeen } from "./storage";

export default function TalkPage() {
  const { t } = useI18n();
  const reduced = usePrefersReducedMotion();
  const thread = useTalkThread();

  const [showDisclosure, setShowDisclosure] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowDisclosure(!disclosureSeen());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }, [thread.messages, thread.typing, reduced]);

  const dismissDisclosure = () => {
    markDisclosureSeen();
    setShowDisclosure(false);
  };

  return (
    // Column stops above the floating dock + raised help pill (~9.5rem incl.
    // safe area) so the composer and its Send button never sit under them.
    <div className="mx-auto flex h-[calc(100dvh-9.5rem-env(safe-area-inset-bottom,0px))] max-w-xl flex-col">
      <header className="shrink-0 border-b border-ink/[0.06] bg-cream/70 px-5 py-3.5 backdrop-blur">
        <h1 className="font-display text-lg font-bold tracking-tight text-ink">
          {t("talk.heading")}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {showDisclosure && <Disclosure onDismiss={dismissDisclosure} />}
        <EscalationInterstitial />

        {thread.isPending ? (
          <p role="status" className="text-earth">
            {t("state.loading")}
          </p>
        ) : thread.isError ? (
          <div role="alert">
            <p className="text-earth">{t("state.error")}</p>
            <button
              type="button"
              className="btn-outline mt-4"
              onClick={() => thread.retryLoad()}
            >
              {t("action.retry")}
            </button>
          </div>
        ) : thread.messages && thread.messages.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-brand"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z" />
              </svg>
            </div>
            <p className="mt-4 text-earth">{t("talk.body")}</p>
          </div>
        ) : (
          thread.messages && (
            <MessageList
              messages={thread.messages}
              typing={thread.typing}
              onRetry={thread.retry}
            />
          )
        )}

        <div ref={bottomRef} />
      </div>

      <Composer onSend={thread.send} />

      {thread.tier3Kind && thread.safetyAssessmentId && (
        <CrisisScreen
          tier3Kind={thread.tier3Kind}
          safetyAssessmentId={thread.safetyAssessmentId}
          onClose={thread.clearTier3Kind}
        />
      )}
    </div>
  );
}
