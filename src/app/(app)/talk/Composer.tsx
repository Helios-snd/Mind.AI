"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n";
import { useVoiceCapture } from "@/lib/useVoiceCapture";

function mmss(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 12l16-8-6 16-3-6-7-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const t = useT();
  const [text, setText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const voice = useVoiceCapture();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 140)}px`;
  }, [text]);

  const submit = () => {
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
    setText("");
    setShowHint(false);
  };

  const stopVoice = async () => {
    await voice.stop();
    // TODO(backend): POST the Blob to the self-hosted STT service, then
    //   setText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
    setShowHint(true);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const recording = voice.state === "recording" || voice.state === "requesting";

  return (
    <div
      className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)" }}
    >
      {(showHint || voice.state === "denied") && (
        <p className="mb-2 text-xs text-gray-500">
          {voice.state === "denied"
            ? t("talk.mic.denied")
            : t("talk.mic.done")}
        </p>
      )}

      {recording ? (
        <div className="flex items-center justify-between rounded-2xl border border-brand/40 bg-cream px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
            {t("talk.mic.recording", { time: mmss(voice.seconds) })}
          </span>
          <span className="flex gap-4">
            <button
              type="button"
              onClick={voice.cancel}
              className="text-sm font-semibold text-gray-500"
            >
              {t("talk.mic.cancel")}
            </button>
            <button
              type="button"
              onClick={stopVoice}
              className="text-sm font-semibold text-brand"
            >
              {t("talk.mic.stop")}
            </button>
          </span>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {voice.state === "idle" && (
            <button
              type="button"
              aria-label={t("talk.mic.start")}
              onClick={() => {
                setShowHint(false);
                voice.start();
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand hover:bg-cream"
            >
              <MicIcon className="h-5 w-5" />
            </button>
          )}

          <textarea
            ref={ref}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setShowHint(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={t("talk.composer.placeholder")}
            className="max-h-36 w-full resize-none overflow-y-auto rounded-2xl border border-gray-300 px-4 py-2.5 text-sm"
          />

          <button
            type="button"
            aria-label={t("talk.composer.send")}
            onClick={submit}
            disabled={text.trim().length === 0}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition-opacity hover:bg-brand-dark disabled:opacity-40"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <p className="mt-1.5 hidden text-[11px] text-gray-400 sm:block">
        {t("talk.composer.hint")}
      </p>
    </div>
  );
}
