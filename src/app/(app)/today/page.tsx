"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
import { AppHeader } from "@/components/AppHeader";
import { CheckInForm, type CheckInDraft } from "./CheckInForm";
import { Acknowledgement } from "./Acknowledgement";
import { reflect } from "./reflect";
import {
  daysSince,
  latestToday,
  loadCheckIns,
  saveCheckIn,
  todayKey,
  type CheckIn,
} from "./storage";

export default function TodayPage() {
  const t = useT();
  const router = useRouter();
  const progress = useOnboardingProgress();

  const [entries, setEntries] = useState<CheckIn[] | null>(null);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    setEntries(loadCheckIns());
  }, []);

  // Not onboarded — send them there. (The tab bar will own this later.)
  useEffect(() => {
    if (progress.data && !progress.data.completedAt) {
      router.replace("/onboarding");
    }
  }, [progress.data, router]);

  const todays = useMemo(
    () => (entries ? latestToday(entries) : undefined),
    [entries],
  );

  const returning = useMemo(() => {
    if (!entries || todays) return false;
    const previous = [...entries].reverse()[0];
    return !!previous && daysSince(previous.date) >= 2;
  }, [entries, todays]);

  if (entries === null) {
    return (
      <Screen>
        <p role="status" className="text-earth">
          {t("state.loading")}
        </p>
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
            reflection={reflect(todays)}
            hadNote={todays.note.trim().length > 0}
            onAddMore={() => setReopened(true)}
          />
        </div>
      </Screen>
    );
  }

  const submit = (draft: CheckInDraft) => {
    const entry: CheckIn = {
      ...draft,
      date: todayKey(),
      at: new Date().toISOString(),
    };
    setEntries(saveCheckIn(entry));
    setReopened(false);
  };

  return (
    <Screen>
      {returning && (
        <div className="mb-7 animate-fade-up rounded-2xl border border-brand/15 bg-brand/[0.06] p-4">
          <p className="text-sm font-semibold text-ink">{t("today.back.title")}</p>
          <p className="mt-1 text-sm text-earth">{t("today.back.body")}</p>
        </div>
      )}

      <AppHeader
        title={t("today.checkin.heading")}
        subtitle={t("today.checkin.sub")}
      />

      <div className="mt-7">
        <CheckInForm onSubmit={submit} />
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x max-w-xl pt-8 pb-28 sm:pt-12">{children}</div>
  );
}
