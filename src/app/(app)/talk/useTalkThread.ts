"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamTalkMessage, useTalkConversation } from "@/api/hooks";
import type { Tier3Kind, TalkStreamEvent } from "@/api/types";
import { newId, type ChatMessage } from "./storage";

/**
 * Owns the Talk thread: hydrates it once from the server, then holds it in
 * local state that `send`/`retry` mutate directly as the SSE stream comes in.
 * Not re-synced from the server afterwards — same reasoning `staleTime:
 * Infinity` uses elsewhere, and there is nothing else writing to this
 * conversation to race against.
 */
export function useTalkThread() {
  const query = useTalkConversation();

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [typing, setTyping] = useState(false);
  const [tier3Kind, setTier3Kind] = useState<Tier3Kind>(null);
  const [safetyAssessmentId, setSafetyAssessmentId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!query.data || hydratedRef.current) return;
    hydratedRef.current = true;
    conversationIdRef.current = query.data.id;
    setMessages(
      query.data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        at: m.at,
      })),
    );
  }, [query.data]);

  useEffect(() => () => cancelRef.current?.(), []);

  const dispatch = useCallback((userMessageId: string, text: string) => {
    setTyping(true);
    setTier3Kind(null);
    setSafetyAssessmentId(null);
    let assistantId: string | null = null;

    const { cancel } = streamTalkMessage(
      text,
      conversationIdRef.current,
      (event: TalkStreamEvent) => {
        if (event.type === "meta") {
          conversationIdRef.current = event.conversationId;
          // Reaching the server is "delivered" — the reply may still take a
          // moment, which is what the typing indicator is for.
          setMessages((prev) =>
            prev?.map((m) =>
              m.id === userMessageId ? { ...m, status: undefined } : m,
            ) ?? prev,
          );
          // Set the instant it's known, ahead of "done" -- the crisis screen
          // takes over before the (short, static) crisis reply even finishes
          // streaming.
          if (event.tier3Kind) {
            setTier3Kind(event.tier3Kind);
            setSafetyAssessmentId(event.safetyAssessmentId);
          }
          return;
        }

        if (event.type === "token") {
          setTyping(false);
          if (assistantId === null) {
            const id = newId();
            assistantId = id;
            setMessages((prev) => [
              ...(prev ?? []),
              { id, role: "assistant", text: event.text, at: new Date().toISOString() },
            ]);
          } else {
            const id = assistantId;
            setMessages((prev) =>
              prev?.map((m) => (m.id === id ? { ...m, text: m.text + event.text } : m)) ??
              prev,
            );
          }
          return;
        }

        if (event.type === "done") {
          setTyping(false);
          return;
        }

        // event.type === "error": nothing ever streamed back, so the send
        // itself is what failed — mirrors the old fixture's retry affordance.
        setTyping(false);
        if (assistantId === null) {
          setMessages((prev) =>
            prev?.map((m) =>
              m.id === userMessageId ? { ...m, status: "failed" } : m,
            ) ?? prev,
          );
        }
      },
    );

    cancelRef.current = cancel;
  }, []);

  const send = useCallback(
    (text: string) => {
      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        text,
        at: new Date().toISOString(),
        status: "sending",
      };
      setMessages((prev) => [...(prev ?? []), userMessage]);
      dispatch(userMessage.id, text);
    },
    [dispatch],
  );

  const retry = useCallback(
    (id: string) => {
      const target = messages?.find((m) => m.id === id);
      if (!target) return;
      setMessages((prev) =>
        prev?.map((m) => (m.id === id ? { ...m, status: "sending" } : m)) ?? prev,
      );
      dispatch(id, target.text);
    },
    [messages, dispatch],
  );

  return {
    isPending: query.isPending,
    isError: query.isError,
    retryLoad: query.refetch,
    messages,
    typing,
    tier3Kind,
    safetyAssessmentId,
    clearTier3Kind: useCallback(() => {
      setTier3Kind(null);
      setSafetyAssessmentId(null);
    }, []),
    send,
    retry,
  };
}
