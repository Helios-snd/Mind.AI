"use client";

import { useRouter } from "next/navigation";
import { useReviewSafetyCase, useSafetyCase } from "@/console-api/hooks";

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Tier-3 safety case: full internal detail, on purpose (see the G plan's
 * Context) -- real tier/tier3_kind/reason_code/confidence, the actual
 * flagged message and its surrounding context, and the student's crisis
 * plan + trusted contact, since that contact is the literal mechanism
 * E3's stubbed auto-contact deferred to a human review.
 */
export function SafetyCaseView({ caseId }: { caseId: string }) {
  const query = useSafetyCase(caseId);
  const review = useReviewSafetyCase();
  const router = useRouter();

  if (query.isPending) return <p className="text-sm text-gray-500">Loading…</p>;
  if (query.isError || !query.data)
    return <p className="text-sm text-red-600">Could not load this case.</p>;

  const c = query.data;
  const alreadyReviewed = c.reviewStatus === "reviewed";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">
          Tier {c.tier}
          {c.tier3Kind ? ` — ${c.tier3Kind}` : ""} · {c.reasonCode}
          {c.confidence != null && ` · confidence ${c.confidence.toFixed(2)}`}
        </p>
        <p className="mt-1 text-xs text-red-700">
          Flagged {fmtDateTime(c.createdAt)}
          {c.countdownStatus && ` · countdown: ${c.countdownStatus}`}
        </p>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Flagged message
        </h2>
        <p className="mt-2 rounded-lg bg-white p-3 text-sm text-gray-900 shadow-sm">
          {c.messageText}
        </p>
      </section>

      {c.contextMessages.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Surrounding conversation
          </h2>
          <ul className="mt-2 space-y-2">
            {c.contextMessages.map((m) => (
              <li key={m.id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                <span className="font-semibold text-gray-500">
                  {m.role === "user" ? "Student" : "Companion"}:
                </span>{" "}
                <span className="text-gray-800">{m.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Crisis plan
        </h2>
        {c.crisisPlan ? (
          <dl className="mt-2 space-y-2 text-sm text-gray-800">
            <div>
              <dt className="font-semibold text-gray-500">Who they'd call</dt>
              <dd>{c.crisisPlan.whoIdCall || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">What helps</dt>
              <dd>{c.crisisPlan.whatHelps || "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-500">What makes it worse</dt>
              <dd>{c.crisisPlan.whatMakesItWorse || "—"}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No crisis plan on file.</p>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trusted contact
        </h2>
        {c.trustedContact && c.trustedContact.name ? (
          <p className="mt-2 text-sm text-gray-800">
            {c.trustedContact.name} ({c.trustedContact.relationship}) —{" "}
            {c.trustedContact.phone}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No trusted contact on file.</p>
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
