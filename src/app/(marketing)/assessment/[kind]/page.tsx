"use client";

import Link from "next/link";
import { useState } from "react";
import { apiClient } from "@/api/hooks";
import { HttpError } from "@/api/httpClient";
import type { AssessmentResult } from "@/api/types";
import { assessmentContent, assessmentSlug } from "@/content/assessmentContent";
import { ResultView } from "./ResultView";

type Stage = "intro" | "questions" | "loading" | "result";

export default function AssessmentPage({
  params,
}: {
  params: { kind: string };
}) {
  const instrument = assessmentSlug[params.kind];
  const definition = instrument ? assessmentContent[instrument] : null;

  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!definition || !instrument) {
    return (
      <Frame>
        <h1 className="h-display text-3xl">Assessment not found</h1>
      </Frame>
    );
  }

  const answer = answers[index];
  const isLast = index === definition.questions.length - 1;
  const answeredAll =
    answers.length === definition.questions.length &&
    answers.every((value) => value !== undefined);

  const save = async () => {
    setError(null);
    setStage("loading");
    try {
      const response = await apiClient.completeAssessment(
        instrument,
        answers.map((value, i) => ({
          itemId: `${instrument}-${i + 1}`,
          value,
        })),
      );
      setResult(response);
      setStage("result");
    } catch (caught) {
      // The previous version swallowed this entirely, so a missing migration,
      // an expired session and a typo in the payload all looked identical --
      // to the student and to whoever was debugging it.
      setError(describe(caught));
      setStage("questions");
    }
  };

  if (stage === "intro") {
    return (
      <Frame>
        <div className="editorial-panel text-center">
          <p className="text-sm font-semibold text-brand">{definition.code}</p>
          <h1 className="h-display mt-3 text-4xl">A few minutes for yourself</h1>
          <p className="mx-auto mt-4 max-w-md text-earth">
            {definition.description} There are no right answers — choose what
            feels most accurate.
          </p>
          <p className="mt-6 font-semibold text-ink">
            {definition.questions.length} questions · about 2–3 minutes
          </p>
          <p className="mt-2 text-sm text-earth">
            This is a screening check-in, not a diagnosis.
          </p>
          <button
            className="btn-primary mt-8"
            onClick={() => setStage("questions")}
          >
            Begin assessment
          </button>
        </div>
      </Frame>
    );
  }

  if (stage === "loading") {
    return (
      <Frame>
        <div className="editorial-panel animate-fade-up text-center">
          <span className="text-4xl text-brand">✦</span>
          <h1 className="h-display mt-4 text-3xl">Preparing your results</h1>
          <p className="mt-3 text-earth">
            Taking a moment to reflect on your responses.
          </p>
          <div className="mx-auto mt-7 h-1.5 w-40 overflow-hidden rounded-full bg-brand/10">
            <span className="block h-full w-2/3 animate-pulse rounded-full bg-brand" />
          </div>
        </div>
      </Frame>
    );
  }

  if (stage === "result" && result) {
    return (
      <Frame>
        <ResultView result={result} instrument={instrument} />
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="question-stage animate-fade-up">
        <Link
          href="/all-resources#assessment"
          className="text-sm font-semibold text-brand"
        >
          ← Back to assessments
        </Link>

        <div className="mt-7 flex justify-between text-sm font-semibold text-earth">
          <span>{definition.title}</span>
          <span>
            Question {index + 1} of {definition.questions.length}
          </span>
        </div>
        <div className="progress-strip mt-3">
          <span
            style={{
              width: `${((index + 1) / definition.questions.length) * 100}%`,
            }}
          />
        </div>

        <p className="mt-8 text-sm font-semibold text-earth">
          {definition.timeframe}, how often have you experienced:
        </p>
        <h1 className="h-display mt-3 text-3xl">
          {definition.questions[index]}
        </h1>

        <div
          className="mt-7 space-y-3"
          role="radiogroup"
          aria-label="Choose an answer"
        >
          {definition.options.map((option, value) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={answer === value}
              onClick={() =>
                // Answers are held by index, so stepping Back and forward
                // again keeps every earlier choice selected.
                setAnswers((old) => {
                  const next = [...old];
                  next[index] = value;
                  return next;
                })
              }
              className={`answer-choice ${
                answer === value ? "answer-choice-selected" : ""
              }`}
            >
              <span aria-hidden="true">{answer === value ? "●" : "○"}</span>
              {option}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-crisis">
            {error}
          </p>
        )}

        <div className="mt-8 flex justify-between">
          <button
            className="text-sm font-semibold text-brand disabled:opacity-30"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            ← Back
          </button>
          <button
            className="btn-primary disabled:opacity-40"
            disabled={answer === undefined || (isLast && !answeredAll)}
            onClick={() => (isLast ? save() : setIndex(index + 1))}
          >
            {isLast ? "Finish assessment" : "Continue →"}
          </button>
        </div>
      </div>
    </Frame>
  );
}

/** Turns a thrown error into something a student can act on. */
function describe(caught: unknown): string {
  if (process.env.NODE_ENV !== "production") {
    // The real cause, for whoever is debugging. The student sees the line below.
    console.error("[assessment] submission failed:", caught);
  }

  if (caught instanceof HttpError) {
    if (caught.status === 401) {
      return "Your session expired while you were answering. Try again and it should go through.";
    }
    if (caught.status === 422 || caught.status === 400) {
      return "Some answers didn't come through correctly. Step back and check each one, then try again.";
    }
    if (caught.status >= 500) {
      return "Something went wrong on our side, not yours. Your answers are still here — try again in a moment.";
    }
  }
  return "We couldn't reach the server. Check your connection — your answers are still here.";
}

function Frame({ children }: { children: React.ReactNode }) {
  return <main className="container-x max-w-2xl py-12 sm:py-20">{children}</main>;
}
