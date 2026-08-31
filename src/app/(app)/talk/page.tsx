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
    <div className="mx-auto flex h-[100dvh] max-w-xl flex-col">
      <header className="shrink-0 border-b border-gray-100 px-5 py-3">
        <h1 className="font-display text-base font-semibold text-gray-900">
          {t("talk.heading")}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {showDisclosure && <Disclosure onDismiss={dismissDisclosure} />}

        {messages === null ? (
          <p role="status" className="text-gray-600">
            {t("state.loading")}
          </p>
        ) : messages.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">{t("talk.body")}</p>
        ) : (
          <MessageList messages={messages} typing={typing} onRetry={retry} />
        )}

        <div ref={bottomRef} />
      </div>

      <Composer onSend={send} />
    </div>
  );
}
