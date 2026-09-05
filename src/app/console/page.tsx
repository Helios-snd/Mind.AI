"use client";

import Link from "next/link";
import { useQueue } from "@/console-api/hooks";
import type { QueueItem } from "@/console-api/types";

const REASON_LABEL: Record<string, string> = {
  "escalation.reason.trend_decline_mood":
    "Mood has been lower than usual for a while",
  "escalation.reason.manual_request": "Asked directly for a counsellor",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function QueueRow({ item }: { item: QueueItem }) {
  const href =
    item.caseType === "safety"
      ? `/console/cases/${item.caseId}?type=safety`
      : `/console/cases/${item.caseId}?type=escalation`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:border-gray-400"
    >
      <div>
        {item.caseType === "safety" ? (
          <p className="text-sm font-semibold text-red-700">
            Tier-3 safety flag {item.tier3Kind ? `(${item.tier3Kind})` : ""}
          </p>
        ) : (
          <p className="text-sm font-semibold text-gray-900">
            {(item.reasonSummaryKey && REASON_LABEL[item.reasonSummaryKey]) ??
              "Approved escalation"}
          </p>
        )}
        <p className="mt-0.5 text-xs text-gray-500">
          {fmtDate(item.createdAt)}
          {item.change != null && ` · change: ${item.change.toFixed(1)}`}
        </p>
      </div>
      <span aria-hidden className="text-gray-400">
        →
      </span>
    </Link>
  );
}

export default function ConsoleQueuePage() {
  const queue = useQueue();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Queue</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tier-3 safety flags first, then approved escalations ranked by how far
        mood has declined.
      </p>

      <div className="mt-6 space-y-3">
        {queue.isPending ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : queue.isError ? (
          <p className="text-sm text-red-600">Could not load the queue.</p>
        ) : queue.data.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing pending review.</p>
        ) : (
          queue.data.map((item) => (
            <QueueRow key={`${item.caseType}-${item.caseId}`} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
