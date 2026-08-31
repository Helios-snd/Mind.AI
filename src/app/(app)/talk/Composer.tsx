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
    <div className="shrink-0 border-t border-ink/[0.06] bg-cream/80 px-4 pb-3 pt-3 backdrop-blur">
      {(showHint || voice.state === "denied") && (
        <p className="mb-2 text-xs leading-relaxed text-earth/70">
          {voice.state === "denied"
            ? t("talk.mic.denied")
            : t("talk.mic.done")}
        </p>
      )}

      {recording ? (
        <div className="flex items-center justify-between rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-crisis" />
            {t("talk.mic.recording", { time: mmss(voice.seconds) })}
          </span>
          <span className="flex gap-4">
            <button
              type="button"
              onClick={voice.cancel}
              className="text-sm font-semibold text-earth/70 hover:text-earth"
            >
              {t("talk.mic.cancel")}
            </button>
            <button
              type="button"
              onClick={stopVoice}
              className="text-sm font-semibold text-brand hover:text-brand-dark"
            >
              {t("talk.mic.stop")}
            </button>
          </span>
        </div>
      ) : (
        <div className="flex items-end gap-2 rounded-[22px] border border-ink/10 bg-cream-alt p-1.5 shadow-soft transition focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10">
          {voice.state === "idle" && (
            <button
              type="button"
              aria-label={t("talk.mic.start")}
              onClick={() => {
                setShowHint(false);
                voice.start();
              }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-earth transition-colors hover:bg-brand/10 hover:text-brand"
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
            className="max-h-36 w-full resize-none self-center overflow-y-auto border-0 bg-transparent px-2 py-2 text-sm text-ink placeholder:text-earth/50 focus:outline-none focus:ring-0"
          />

          <button
            type="button"
            aria-label={t("talk.composer.send")}
            onClick={submit}
            disabled={text.trim().length === 0}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-soft transition-all hover:bg-brand-dark disabled:scale-90 disabled:opacity-30 disabled:shadow-none"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <p className="mt-2 hidden text-center text-[11px] text-earth/50 sm:block">
        {t("talk.composer.hint")}
      </p>
    </div>
  );
}
