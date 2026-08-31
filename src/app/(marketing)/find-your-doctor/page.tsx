"use client";

import { useState } from "react";
import Link from "next/link";
import { Section } from "@/components/Section";
import { EMERGENCY_HELPLINE } from "@/data/nav";
import { matchQuestions as questions } from "@/data/therapistMatch";

export default function Page() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const total = questions.length;
  const current = questions[step];
  const done = step >= total;

  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <h1 className="h-display text-center text-4xl">
          Find Your Best Therapy Match
        </h1>
        <p className="mt-3 text-center text-gray-600">
          Confused about your problem? Discover your needs and preferences
          through our interactive pre-assessment. We&apos;ll help you find the
          right therapist and approach for you.
        </p>

        {!done ? (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${
                    i === step
                      ? "bg-brand text-white"
                      : i < step
                        ? "bg-brand/20 text-brand"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>

            <p className="text-sm font-semibold text-brand">
              Question {step + 1}
            </p>
            <h2 className="mt-1 font-display text-xl text-gray-900">
              {current.q}
            </h2>

            <div className="mt-5 space-y-3">
              {current.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${
                    answers[step] === opt
                      ? "border-brand bg-cream"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${step}`}
                    checked={answers[step] === opt}
                    onChange={() =>
                      setAnswers((a) => ({ ...a, [step]: opt }))
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                className="btn-outline"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                Previous
              </button>
              <button
                className="btn-primary"
                disabled={!answers[step]}
                onClick={() => setStep((s) => s + 1)}
              >
                {step === total - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="h-display text-2xl">Thanks — you&apos;re all set!</h2>
            <p className="mt-2 text-gray-600">
              Based on your answers we&apos;ll match you with a therapist who
              fits your needs.
            </p>
            <Link href="/our-experts" className="btn-primary mt-6">
              Browse Our Experts
            </Link>
          </div>
        )}

        <p className="mx-auto mt-6 max-w-md text-center text-xs text-gray-400">
          If you need urgent support, call{" "}
          <a href="tel:18008914416" className="font-semibold text-brand">
            {EMERGENCY_HELPLINE}
          </a>
        </p>
      </div>
    </Section>
  );
}
