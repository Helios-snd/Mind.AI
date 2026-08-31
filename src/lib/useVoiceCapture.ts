"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Microphone capture for the check-in note and (later) the Talk composer.
 *
 * This records real audio with MediaRecorder — permission prompt, a running
 * timer, stop / cancel — but it does NOT transcribe. Turning speech into text
 * is a backend job (a self-hosted STT service, per the privacy constraint that
 * audio must not leave controlled infrastructure), so `stop()` resolves with the
 * raw Blob and the caller shows an editable field for now.
 *
 *   const voice = useVoiceCapture();
 *   voice.start();
 *   const blob = await voice.stop();   // TODO(backend): send blob to STT
 */
export type VoiceState =
  | "idle"
  | "requesting"
  | "recording"
  | "denied"
  | "unsupported";

export function useVoiceCapture() {
  const [state, setState] = useState<VoiceState>("idle");
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== "undefined";
    if (!ok) setState("unsupported");
    return () => teardown();
  }, [teardown]);

  const start = useCallback(async () => {
    if (state === "recording" || state === "requesting" || state === "unsupported") {
      return;
    }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        teardown();
        setState("idle");
        resolveRef.current?.(blob);
        resolveRef.current = null;
      };

      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      timerRef.current = window.setInterval(
        () => setSeconds((value) => value + 1),
        1000,
      );
      setState("recording");
    } catch {
      teardown();
      setState("denied");
    }
  }, [state, teardown]);

  /** Stop and hand back the recording. Resolves null if nothing was recording. */
  const stop = useCallback(() => {
    return new Promise<Blob | null>((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      resolveRef.current = resolve;
      recorder.stop();
    });
  }, []);

  /** Abandon the recording — no Blob, back to idle. */
  const cancel = useCallback(() => {
    resolveRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    teardown();
    setState((current) => (current === "unsupported" ? current : "idle"));
  }, [teardown]);

  return { state, seconds, start, stop, cancel };
}
