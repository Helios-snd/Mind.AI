"use client";

import { useState } from "react";
import { useT } from "@/i18n";
import { TextField } from "@/components/formFields";
import { authApi } from "@/api/httpClient";

/**
 * "Keep your account" — the recovery path for an anonymous account.
 *
 * Deliberately the last step and deliberately skippable: the product promise
 * is no signup wall before the student has seen something useful, so identity
 * is asked for only after they have already done the work.
 */
export default function StepClaim({
  onDone,
  busy = false,
}: {
  onDone: () => void;
  busy?: boolean;
}) {
  const t = useT();

  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const send = async () => {
    if (!destination.trim()) {
      setError(t("onboarding.claim.error.destination"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { devCode: dev } = await authApi.claim(destination.trim());
      setSent(true);
      setDevCode(dev);
    } catch {
      // The server refuses a destination already linked elsewhere; every other
      // failure reads the same to the student.
      setError(t("onboarding.claim.error.taken"));
    } finally {
      setPending(false);
    }
  };

  const verify = async () => {
    setPending(true);
    setError(null);
    try {
      await authApi.verify(destination.trim(), code.trim());
      onDone();
    } catch {
      setError(t("onboarding.claim.error.code"));
    } finally {
      setPending(false);
    }
  };

  const disabled = busy || pending;

  return (
    <div className="animate-fade-up">
      <h1 className="h-display text-[26px] leading-tight">
        {t("onboarding.claim.heading")}
      </h1>
      <p className="mt-3 text-sm text-earth">{t("onboarding.claim.subline")}</p>

      <div className="mt-8 space-y-4">
        <TextField
          id="claim-destination"
          label={t("onboarding.claim.label")}
          value={destination}
          onChange={setDestination}
          error={!sent && error ? error : undefined}
        />

        {sent && (
          <>
            <p role="status" className="text-sm text-earth">
              {t("onboarding.claim.sent")}
            </p>
            {devCode && (
              <p className="text-xs text-earth/70">
                {t("onboarding.claim.devCode", { code: devCode })}
              </p>
            )}
            <TextField
              id="claim-code"
              label={t("onboarding.claim.codeLabel")}
              value={code}
              onChange={setCode}
              inputMode="tel"
              error={error ?? undefined}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {!sent ? (
          <button
            type="button"
            className="btn-primary disabled:opacity-40"
            disabled={disabled}
            onClick={send}
          >
            {t("onboarding.claim.send")}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary disabled:opacity-40"
            disabled={disabled || code.trim().length === 0}
            onClick={verify}
          >
            {t("onboarding.claim.verify")}
          </button>
        )}

        <button
          type="button"
          className="text-sm font-semibold text-earth underline-offset-4 hover:underline disabled:opacity-40"
          disabled={disabled}
          onClick={onDone}
        >
          {t("onboarding.claim.skip")}
        </button>
      </div>

      <p className="mt-4 text-xs text-earth/80">
        {t("onboarding.claim.skipNote")}
      </p>
    </div>
  );
}
