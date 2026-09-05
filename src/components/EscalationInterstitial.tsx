"use client";

import { isKey, useI18n } from "@/i18n";
import type { Keys } from "@/i18n/en";
import {
  useApproveEscalation,
  useDeclineEscalation,
  useEscalation,
} from "@/api/hooks";

const SHARE_KEYS: Record<string, Keys> = {
  checkins: "escalation.share.checkins",
  talk_messages: "escalation.share.talkMessages",
  reason: "escalation.share.reason",
  // F3: a student-initiated request from /human, not a Trend-fired offer --
  // "reason" reads as "the reason we're suggesting support", which is
  // backwards for an ask the student made themselves. See
  // backend/app/modules/escalations/service.py::MANUAL_SHARE_SCOPE.
  request: "escalation.share.request",
};

/**
 * A pending offer of human support -- either Trend noticed something (E1)
 * or the student asked directly (F3, "Request support" on /human). Same
 * "here's what we noticed/here's what you asked for" plus a concrete list of
 * what a release to a counsellor would include, rendered wherever a pending
 * brief exists: /talk (where E1 first showed it) and /human (F3). Nothing is
 * marked releasable until the student approves — see backend/app/modules/
 * escalations, where released_to_counsellor_at stays null until then.
 */
export function EscalationInterstitial() {
  const { t } = useI18n();
  const escalation = useEscalation();
  const approve = useApproveEscalation();
  const decline = useDeclineEscalation();

  const brief = escalation.data;
  if (!brief) return null;

  const reason = isKey(brief.reasonSummaryKey) ? t(brief.reasonSummaryKey) : null;
  if (!reason) return null;

  return (
    <div className="mb-6 animate-fade-up rounded-2xl border border-brand/15 bg-brand/[0.06] p-5">
      <p className="text-sm leading-relaxed text-ink">{reason}</p>

      <div className="mt-4 rounded-xl border border-ink/[0.06] bg-cream-alt/60 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-earth/70">
          {t("escalation.share.heading")}
        </p>
        <ul className="mt-2 space-y-1 text-sm text-ink">
          {brief.shareScope.map((scope) => {
            const key = SHARE_KEYS[scope];
            return key ? <li key={scope}>• {t(key)}</li> : null;
          })}
        </ul>
        <p className="mt-2.5 text-xs text-earth/70">
          {t("escalation.share.nothingElse")}
        </p>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => approve.mutate(brief.id)}
          disabled={approve.isPending || decline.isPending}
          className="btn-primary"
        >
          {t("escalation.approve")}
        </button>
        <button
          type="button"
          onClick={() => decline.mutate(brief.id)}
          disabled={approve.isPending || decline.isPending}
          className="btn-outline"
        >
          {t("escalation.notNow")}
        </button>
      </div>
    </div>
  );
}
