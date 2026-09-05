"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { SafetyCaseView } from "./SafetyCaseView";
import { EscalationCaseView } from "./EscalationCaseView";

/**
 * Switches on caseType to render one of two wholly separate view
 * components -- never a single component branching internally on every
 * field. That split is what makes it structurally impossible for a future
 * edit to one case type's view to leak a field into the other's.
 */
export default function ConsoleCasePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const caseType = searchParams.get("type");

  return (
    <div>
      <Link href="/console" className="text-sm font-semibold text-gray-500">
        ← Back to queue
      </Link>

      <div className="mt-4">
        {caseType === "safety" ? (
          <SafetyCaseView caseId={params.id} />
        ) : caseType === "escalation" ? (
          <EscalationCaseView caseId={params.id} />
        ) : (
          <p className="text-sm text-red-600">Unknown case type.</p>
        )}
      </div>
    </div>
  );
}
