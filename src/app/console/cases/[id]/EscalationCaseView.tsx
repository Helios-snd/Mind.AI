"use client";

import { useRouter } from "next/navigation";
import { useEscalationCase, useReviewEscalationCase } from "@/console-api/hooks";

const REASON_LABEL: Record<string, string> = {
  "escalation.reason.trend_decline_mood":
    "Mood has been lower than usual for a while",
  "escalation.reason.manual_request": "Asked directly for a counsellor",
};

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * An approved escalation: strictly bounded by shareScope. check_ins/messages
 * are null (not an empty array) when their category was never approved --
 * rendered as "not shared", never as an empty list that could be misread as
 * "shared, but there was nothing". Never the crisis plan or trusted contact
 * here -- those were never in share_scope, and the whole point of the
 * approval gate is that nothing outside it is releasable.
 */
export function EscalationCaseView({ caseId }: { caseId: string }) {
  const query = useEscalationCase(caseId);
  const review = useReviewEscalationCase();
  const router = useRouter();

  if (query.isPending) return <p className="text-sm text-gray-500">Loading…</p>;
  if (query.isError || !query.data)
    return <p className="text-sm text-red-600">Could not load this case.</p>;

  const c = query.data;
  const alreadyReviewed = !!c.counsellorReviewedAt;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
        <p className="text-sm font-semibold text-gray-900">
          {REASON_LABEL[c.reasonSummaryKey] ?? c.reasonSummaryKey}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Approved {fmtDateTime(c.createdAt)} · fired by {c.firedBy}
          {c.change != null && ` · change: ${c.change.toFixed(1)}`}
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Check-ins
        </h2>
        {c.checkIns === null ? (
          <p className="mt-2 text-sm text-gray-400">Not shared for this case.</p>
        ) : c.checkIns.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">None in the shared window.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-gray-800">
            {c.checkIns.map((ci) => (
              <li key={ci.date}>
                {ci.date} — mood {ci.mood}, {ci.sleepHours}h sleep
                {ci.note ? ` — "${ci.note}"` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Talk messages
        </h2>
        {c.messages === null ? (
          <p className="mt-2 text-sm text-gray-400">Not shared for this case.</p>
        ) : c.messages.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">None in the shared window.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {c.messages.map((m) => (
              <li key={m.id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                <span className="font-semibold text-gray-500">
                  {m.role === "user" ? "Student" : "Companion"}:
                </span>{" "}
                <span className="text-gray-800">{m.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        disabled={alreadyReviewed || review.isPending}
        onClick={() =>
          review.mutate(caseId, { onSuccess: () => router.push("/console") })
        }
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {alreadyReviewed ? "Already reviewed" : "Mark reviewed"}
      </button>
    </div>
  );
}
