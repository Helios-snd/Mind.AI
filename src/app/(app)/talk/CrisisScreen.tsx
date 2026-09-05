"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n";
import { useCancelCountdown, useContact, useCrisisPlan, useExpireCountdown } from "@/api/hooks";
import type { Tier3Kind } from "@/api/types";

// 5:00 -- must match the backend's own COUNTDOWN_SECONDS
// (backend/app/modules/talk/service.py).
const COUNTDOWN_SECONDS = 300;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * The tier-3 experience: Safety has already suppressed Companion and shown
 * the static crisis reply in the thread (talk/service.py::CRISIS_RESPONSE);
 * this takes over the screen the moment useTalkThread reports a tier3Kind.
 *
 * 3a and 3b share this screen. 3b additionally gets a 5:00 countdown: any
 * interaction (a click, a key, a touch, anywhere on the screen — including
 * navigating away) cancels it; only complete silence lets it expire. Either
 * way it's just recorded (see useCancelCountdown/useExpireCountdown) — no
 * real contact is ever sent. No approval step: unlike the tier-2
 * interstitial, tier 3 doesn't ask permission, it acts. Human review already
 * happens server-side via safety_assessments.review_status, independent of
 * anything rendered here.
 */
export function CrisisScreen({
  tier3Kind,
  safetyAssessmentId,
  onClose,
}: {
  tier3Kind: Tier3Kind;
  safetyAssessmentId: string;
  onClose: () => void;
}) {
  const t = useT();
  const plan = useCrisisPlan();
  const contact = useContact();
  const cancelMutation = useCancelCountdown();
  const expireMutation = useExpireCountdown();

  const is3b = tier3Kind === "3b";

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [countdownActive, setCountdownActive] = useState(is3b);
  // A ref, not state: resolve() must be safely callable more than once in
  // the same tick (a click landing right as the timer fires) without
  // double-submitting to the server. React state updates aren't visible
  // synchronously across two handlers firing in the same event; a ref is.
  const resolvedRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const resolve = useCallback(
    (outcome: "cancelled" | "expired") => {
      if (!is3b || resolvedRef.current) return;
      resolvedRef.current = true;
      setCountdownActive(false);
      if (outcome === "expired") {
        expireMutation.mutate(safetyAssessmentId);
      } else {
        cancelMutation.mutate(safetyAssessmentId);
      }
    },
    [is3b, safetyAssessmentId, cancelMutation, expireMutation],
  );

  // The ticking timer.
  useEffect(() => {
    if (!is3b || !countdownActive) return;
    if (secondsLeft <= 0) {
      resolve("expired");
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [is3b, countdownActive, secondsLeft, resolve]);

  // Deliberately no "cancel on unmount" hook here. It would only ever catch
  // one departure path (in-app navigation) and would still miss the more
  // common ones -- closing the tab, a crash, force-quit -- none of which
  // run a React cleanup either. The lazy server-side sweep
  // (expire_stale_countdowns, checked on the next Talk request from this
  // student) already exists specifically to catch every "the client is
  // gone" case uniformly; special-casing one of them here would be both
  // redundant and, in dev, actively wrong -- React 18 StrictMode
  // double-invokes effects, so a mount-then-cleanup-only effect fires its
  // cleanup immediately and would cancel the countdown before it ever
  // renders.
  const handleInteraction = () => resolve("cancelled");

  const handleClose = () => {
    resolve("cancelled");
    onClose();
  };

  const smsHref = contact.data
    ? `sms:${contact.data.phone}?body=${encodeURIComponent(t("help.contact.prefill"))}`
    : undefined;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[60] overflow-y-auto bg-cream focus:outline-none"
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="mx-auto max-w-md px-5 py-10 pb-16">
        {is3b && countdownActive && (
          <div className="mb-5 rounded-2xl border border-crisis/30 bg-crisis/[0.08] p-5">
            <p
              className="text-3xl font-bold tabular-nums text-crisis"
              role="status"
              aria-live="polite"
            >
              {formatCountdown(secondsLeft)}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              {t("crisis.countdown.label")}
            </p>
            <button
              type="button"
              onClick={() => resolve("cancelled")}
              className="btn-primary mt-4 w-full"
            >
              {t("crisis.countdown.cancel")}
            </button>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-widest text-crisis">
          {t("crisis.heading")}
        </p>

        <a
          href="tel:14416"
          className="mt-5 block rounded-2xl border border-crisis/30 bg-crisis/[0.06] p-5 transition hover:bg-crisis/10"
        >
          <p className="font-display text-lg font-semibold text-ink">
            {t("help.telemanas.title")}
          </p>
          <p className="mt-1 text-sm text-earth">{t("help.telemanas.subtitle")}</p>
        </a>

        <div className="mt-5 rounded-2xl border border-ink/[0.07] bg-cream-alt/60 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-earth/70">
            {t("help.plan.title")}
          </p>
          {plan.data ? (
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm font-semibold text-ink">
                  {t("onboarding.crisis.q1.label")}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-earth">
                  {plan.data.whoIdCall}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-ink">
                  {t("onboarding.crisis.q2.label")}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-earth">
                  {plan.data.whatHelps}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-ink">
                  {t("onboarding.crisis.q3.label")}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-earth">
                  {plan.data.whatMakesItWorse}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-earth">{t("help.plan.empty")}</p>
          )}
        </div>

        {contact.data && smsHref && (
          <a
            href={smsHref}
            className="mt-5 block rounded-2xl border border-ink/[0.07] bg-cream-alt/60 p-5 transition hover:bg-brand/[0.05]"
          >
            <p className="font-semibold text-ink">
              {t("help.contact.title", { name: contact.data.name })}
            </p>
            <p className="mt-1 text-sm text-earth">{t("help.contact.subtitle")}</p>
          </a>
        )}

        <p className="mt-6 rounded-xl border border-brand/15 bg-brand/[0.06] px-4 py-3 text-sm leading-relaxed text-ink">
          {t("crisis.humanReview")}
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="btn-primary mt-6 w-full"
        >
          {t("crisis.back")}
        </button>
      </div>
    </div>
  );
}
