"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { AppHeader } from "@/components/AppHeader";
import { useCheckIns, useSaveCheckIn } from "@/api/hooks";
import { CheckInForm, type CheckInDraft } from "./CheckInForm";
import { Acknowledgement } from "./Acknowledgement";
import { daysSince, latestToday, todayKey } from "./storage";

export default function TodayPage() {
  const t = useT();

  const router = useRouter();
  const reduced = usePrefersReducedMotion();

  const checkIns = useCheckIns();
  const save = useSaveCheckIn();
  const [reopened, setReopened] = useState(false);
  // Set only after the server confirms the save, never on a failed submit.
  const [handoff, setHandoff] = useState(false);

  useEffect(() => {
    if (!handoff) return;
    // A beat to read the acknowledgement, then on to Trends -- the check-in is
    // already saved, so this is a transition, not a wait. Shortened when the
    // viewer has asked for less movement.
    const delay = reduced ? 400 : 1600;
    const id = window.setTimeout(() => router.push("/trends"), delay);
    return () => window.clearTimeout(id);
  }, [handoff, reduced, router]);

  const entries = checkIns.data;

  const todays = useMemo(
    () => (entries ? latestToday(entries) : undefined),
    [entries],
  );

  const returning = useMemo(() => {
    if (!entries || todays) return false;
    // The list arrives newest-first, so the most recent is the head.
    const previous = entries[0];
    return !!previous && daysSince(previous.date) >= 2;
  }, [entries, todays]);

  if (checkIns.isPending) {
    return (
      <Screen>
        <p role="status" className="text-earth">
          {t("state.loading")}
        </p>
      </Screen>
    );
  }

  // No silent fallback to local data. If the server cannot be reached the
  // student is told, because a check-in that only ever existed in this browser
  // is worse than one that was never taken.
  if (checkIns.isError || !entries) {
    return (
      <Screen>
        <div role="alert">
          <p className="text-earth">{t("state.error")}</p>
          <button
            type="button"
            className="btn-outline mt-4"
            onClick={() => checkIns.refetch()}
          >
            {t("action.retry")}
          </button>
        </div>
      </Screen>
    );
  }

  // Already checked in today — the calm "done" state.
  if (todays && !reopened) {
    return (
      <Screen>
        <AppHeader title={t("today.done.heading")} />
        <div className="mt-6">
          <Acknowledgement
            reflection={todays.reflection}
            hadNote={todays.note.trim().length > 0}
            onAddMore={() => setReopened(true)}
          />

          {handoff ? (
            <p role="status" className="mt-6 text-sm text-earth">
              {t("today.handoff.body")}
            </p>
          ) : (
            <Link href="/trends" className="btn-primary mt-6 inline-flex">
              {t("today.done.seeTrends")}
            </Link>
          )}
        </div>
      </Screen>
    );
  }

  const submit = async (draft: CheckInDraft) => {
    // mutateAsync rejects on failure, so nothing below runs unless the server
    // confirmed the write. A failed submit leaves the student on the form with
    // their answers intact.
    await save.mutateAsync({ ...draft, date: todayKey() });
    setReopened(false);
    setHandoff(true);
  };

  return (
    <Screen>
      {returning && (
        <div className="insight-panel mb-7 animate-fade-up">
          <p className="text-sm font-semibold text-ink">{t("today.back.title")}</p>
          <p className="mt-1 text-sm text-earth">{t("today.back.body")}</p>
        </div>
      )}

      <AppHeader
        title={t("today.checkin.heading")}
        subtitle={t("today.checkin.sub")}
      />

      <div className="mt-7">
        <CheckInForm
          onSubmit={submit}
          submitting={save.isPending}
          failed={save.isError}
        />
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x max-w-xl pt-8 pb-28 sm:pt-12">{children}</div>
  );
}
