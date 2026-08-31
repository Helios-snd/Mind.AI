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

export function NoteField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const t = useT();
  const ref = useRef<HTMLTextAreaElement>(null);
  const voice = useVoiceCapture();
  const [showTranscribeHint, setShowTranscribeHint] = useState(false);

  // Auto-grow to fit the content.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  const stopVoice = async () => {
    await voice.stop();
    // TODO(backend): POST the Blob to the self-hosted STT service, then
    //   onChange(value ? `${value.trim()} ${transcript}` : transcript);
    // For now the field just opens for typing / editing.
    setShowTranscribeHint(true);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const recording = voice.state === "recording" || voice.state === "requesting";

  if (recording) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-brand/40 bg-cream px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
          {t("today.note.mic.recording", { time: mmss(voice.seconds) })}
        </span>
        <span className="flex gap-4">
          <button
            type="button"
            onClick={voice.cancel}
            className="text-sm font-semibold text-gray-500"
          >
            {t("today.note.mic.cancel")}
          </button>
          <button
            type="button"
            onClick={stopVoice}
            className="text-sm font-semibold text-brand"
          >
            {t("today.note.mic.stop")}
          </button>
        </span>
      </div>
    );
  }

  const canRecord = voice.state === "idle";

  return (
    <div>
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setShowTranscribeHint(false);
        }}
        rows={3}
        placeholder={t("today.note.placeholder")}
        className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm"
      />
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-xs text-gray-500">
          {showTranscribeHint
            ? t("today.note.mic.done")
            : voice.state === "denied"
              ? t("today.note.mic.denied")
              : ""}
        </p>
        {canRecord && (
          <button
            type="button"
            onClick={() => {
              setShowTranscribeHint(false);
              voice.start();
            }}
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <MicIcon className="h-4 w-4" />
            {t("today.note.mic.start")}
          </button>
        )}
      </div>
    </div>
  );
}
