"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { Disclosure } from "./Disclosure";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { replyKeyFor } from "./replies";
import {
  disclosureSeen,
  loadThread,
  markDisclosureSeen,
  newId,
  saveThread,
  type ChatMessage,
} from "./storage";

export default function TalkPage() {
  const { t } = useI18n();
  const router = useRouter();
  const progress = useOnboardingProgress();
  const reduced = usePrefersReducedMotion();

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMessages(loadThread());
    setShowDisclosure(!disclosureSeen());
  }, []);

  // Not onboarded — send them there. (The tab bar will own this later.)
  useEffect(() => {
    if (progress.data && !progress.data.completedAt) {
      router.replace("/onboarding");
    }
  }, [progress.data, router]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }, [messages, typing, reduced]);

  const persist = useCallback((next: ChatMessage[]) => {
    setMessages(next);
    saveThread(next);
  }, []);

  const respond = useCallback(
    (thread: ChatMessage[], userMessage: ChatMessage) => {
      setTyping(true);
      const forceFail =
        typeof window !== "undefined" &&
        (window as unknown as { __talkFail?: boolean }).__talkFail;
      const delay = reduced ? 300 : 700 + Math.random() * 700;

      const id = window.setTimeout(() => {
        setTyping(false);
        if (forceFail) {
          persist(
            thread.map((m) =>
              m.id === userMessage.id ? { ...m, status: "failed" as const } : m,
            ),
          );
          return;
        }
        const userTurns = thread.filter((m) => m.role === "user").length;
        const delivered = thread.map((m) =>
          m.id === userMessage.id ? { ...m, status: undefined } : m,
        );
        persist([
          ...delivered,
          {
            id: newId(),
            role: "assistant",
            text: t(replyKeyFor(userMessage.text, userTurns)),
            at: new Date().toISOString(),
          },
        ]);
      }, delay);

      timers.current.push(id);
    },
    [persist, reduced, t],
  );

  const send = useCallback(
    (text: string) => {
      if (messages === null) return;
      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        text,
        at: new Date().toISOString(),
      };
      const withUser = [...messages, userMessage];
      persist(withUser);
      respond(withUser, userMessage);
    },
    [messages, persist, respond],
  );

  const retry = useCallback(
    (id: string) => {
      if (messages === null) return;
      const target = messages.find((m) => m.id === id);
      if (!target) return;
      const cleared = messages.map((m) =>
        m.id === id ? { ...m, status: "sending" as const } : m,
      );
      persist(cleared);
      respond(cleared, { ...target, status: undefined });
    },
    [messages, persist, respond],
  );

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

        {messages === null ? (
          <p role="status" className="text-earth">
            {t("state.loading")}
          </p>
        ) : messages.length === 0 ? (
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
          <MessageList messages={messages} typing={typing} onRetry={retry} />
        )}

        <div ref={bottomRef} />
      </div>

      <Composer onSend={send} />
    </div>
  );
}
