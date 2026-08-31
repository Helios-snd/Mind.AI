"use client";

import { useI18n, useT } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import type { Language } from "@/api/types";
import { localDayKey, type ChatMessage } from "./storage";

function dayLabel(
  key: string,
  t: ReturnType<typeof useI18n>["t"],
  language: Language,
): string {
  if (key === localDayKey()) return t("talk.day.today");
  if (key === localDayKey(new Date(Date.now() - 86_400_000))) {
    return t("talk.day.yesterday");
  }
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-IN", {
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

function groupByDay(messages: ChatMessage[]) {
  const groups: { key: string; items: ChatMessage[] }[] = [];
  for (const message of messages) {
    const key = localDayKey(new Date(message.at));
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(message);
    else groups.push({ key, items: [message] });
  }
  return groups;
}

export function MessageList({
  messages,
  typing,
  onRetry,
}: {
  messages: ChatMessage[];
  typing: boolean;
  onRetry: (id: string) => void;
}) {
  const { t, language } = useI18n();

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className="space-y-6">
      {groupByDay(messages).map((group) => (
        <div key={group.key} className="space-y-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-gray-300">
            {dayLabel(group.key, t, language)}
          </p>
          {group.items.map((message) => (
            <Bubble
              key={message.id}
              message={message}
              live={message.id === lastAssistantId}
              onRetry={onRetry}
            />
          ))}
        </div>
      ))}
      {typing && <TypingIndicator />}
    </div>
  );
}

function Bubble({
  message,
  live,
  onRetry,
}: {
  message: ChatMessage;
  live: boolean;
  onRetry: (id: string) => void;
}) {
  const t = useT();
  const mine = message.role === "user";

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div
        aria-live={live ? "polite" : undefined}
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          mine ? "bg-brand text-white" : "bg-gray-100 text-gray-900"
        } ${message.status === "failed" ? "opacity-60" : ""}`}
      >
        {message.text}
      </div>
      {message.status === "failed" && (
        <button
          type="button"
          onClick={() => onRetry(message.id)}
          className="mt-1 text-xs font-semibold text-brand-dark"
        >
          {t("talk.failed")} {t("talk.retry")}
        </button>
      )}
    </div>
  );
}

function TypingIndicator() {
  const t = useT();
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <p className="text-sm text-gray-400">{t("talk.typing")}</p>;
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3"
      role="status"
      aria-label={t("talk.typing")}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
