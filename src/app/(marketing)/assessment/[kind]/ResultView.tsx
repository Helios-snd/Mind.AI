"use client";

import Link from "next/link";
import type { AssessmentInstrument, AssessmentResult } from "@/api/types";
import { assessmentContent } from "@/content/assessmentContent";
import { useCountUp } from "./useCountUp";

/**
 * The result screen.
 *
 * Two distinct shapes, and the difference matters: a submission flagged for
 * safety review never receives a score, a band, or a reassuring summary. It is
 * routed to support instead. Showing someone a tidy number after they reported
 * thoughts of self-harm would be the wrong response to the most important
 * thing they told us.
 */
export function ResultView({
  result,
  instrument,
}: {
  result: AssessmentResult;
  instrument: AssessmentInstrument;
}) {
  const definition = assessmentContent[instrument];

  if (result.requiresSafetyReview) {
    return (
      <div className="support-panel animate-fade-up">
        <h1 className="h-display text-3xl">You deserve support right now.</h1>
        <p className="mt-3 text-earth">
          One of your answers is something we take seriously, so we&apos;re not
          showing a routine screening score for it. That isn&apos;t a judgement
          — it just isn&apos;t the useful thing to hand you right now.
        </p>
        <div className="mt-6 grid gap-3">
          <Link href="/human" className="btn-primary text-center">
            Talk to a real person
          </Link>
          <a
            href="tel:14416"
            className="settings-surface block text-center font-semibold"
          >
            Call Tele-MANAS — 14416
            <span className="mt-1 block text-sm font-normal text-earth">
              Free, 24 hours, in Bengali or English.
            </span>
          </a>
          <Link
            href="/talk"
            className="text-center text-sm font-semibold text-brand"
          >
            Or talk it through with Mind.AI first →
          </Link>
        </div>
      </div>
    );
  }

  return <ScoredResult result={result} definition={definition} />;
}

function ScoredResult({
  result,
  definition,
}: {
  result: AssessmentResult;
  definition: { title: string };
}) {
  // ASRS is a threshold screener, not a severity scale: it reports how many
  // answers crossed the cut-off, and its band is a sentence rather than a word.
  const isThresholdScreener = result.positiveCount !== null;

  const shown = useCountUp(result.score);
  const pct =
    result.score !== null && result.maximum
      ? Math.round((result.score / result.maximum) * 100)
      : 0;

  return (
    <div className="result-panel animate-fade-up">
      <p className="font-semibold text-brand">{definition.title} results</p>

      <div className="relative mx-auto mt-5 grid h-36 w-36 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-brand/15"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-brand transition-[stroke-dashoffset] duration-[900ms] ease-out"
            style={{
              strokeDasharray: 2 * Math.PI * 44,
              strokeDashoffset: 2 * Math.PI * 44 * (1 - pct / 100),
            }}
          />
        </svg>
        <p className="font-display text-5xl text-ink">
          {shown}
          <span className="text-lg text-earth">/{result.maximum}</span>
        </p>
      </div>

      {/* "moderate range" reads well; "further evaluation may be worthwhile
          range" does not, so the threshold screener gets its band as a
          sentence on its own. */}
      {result.band &&
        (isThresholdScreener ? (
          <p className="mt-4 text-lg font-semibold text-brand">
            {sentenceCase(result.band)}
          </p>
        ) : (
          <p className="mt-4 text-lg font-semibold capitalize text-brand">
            {result.band} range
          </p>
        ))}

      <div className="insight-panel mt-7 text-left">
        <h2 className="font-display text-xl text-ink">What your result means</h2>
        <p className="mt-2 text-earth">
          {interpretation(result.band, isThresholdScreener)}
        </p>
        <p className="mt-3 text-sm text-earth">
          This is a screening check-in, not a diagnosis. A qualified
          professional can help place it in context.
        </p>
      </div>

      <div className="mt-7 text-left">
        <h2 className="font-display text-xl text-ink">What you can do next</h2>
        <div className="mt-3 grid gap-3">
          <Link href="/talk" className="feature-tile p-4">
            <b>Talk with Mind.AI</b>
            <span className="mt-1 block text-sm text-earth">
              Put these feelings into words. →
            </span>
          </Link>
          <Link href="/human" className="settings-surface">
            <b>Connect with human support</b>
            <span className="mt-1 block text-sm text-earth">
              A real person can help you explore this. →
            </span>
          </Link>
          <Link
            href="/all-resources"
            className="text-sm font-semibold text-brand"
          >
            Explore helpful resources →
          </Link>
        </div>
      </div>
    </div>
  );
}

function sentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function interpretation(band: string | null, isThresholdScreener: boolean): string {
  if (isThresholdScreener) {
    return band?.startsWith("further")
      ? "Enough of your answers crossed this screener's threshold that exploring it further with a qualified professional may be worthwhile."
      : "Your answers did not reach this screener's referral threshold. That doesn't mean nothing is going on — only that this particular screen didn't flag it.";
  }
  if (band === "minimal") {
    return "Your responses suggest relatively few symptoms over the period covered.";
  }
  if (band === "mild") {
    return "Your responses suggest some symptoms that may be worth noticing with care.";
  }
  return "Your responses suggest several symptoms over the period covered. Consider talking with someone you trust, or with a qualified professional.";
}
