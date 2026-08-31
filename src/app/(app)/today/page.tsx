"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useOnboardingProgress } from "@/api/hooks";
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
        <p role="status" className="text-gray-600">
          {t("state.loading")}
        </p>
      </Screen>
    );
  }

  // Already checked in today — the calm "done" state.
  if (todays && !reopened) {
    return (
      <Screen>
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          {t("today.done.heading")}
        </h1>
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
        <div className="mb-8 rounded-2xl bg-cream p-4">
          <p className="font-semibold text-gray-900">{t("today.back.title")}</p>
          <p className="mt-1 text-sm text-gray-600">{t("today.back.body")}</p>
        </div>
      )}

      <h1 className="font-display text-2xl font-semibold text-gray-900">
        {t("today.checkin.heading")}
      </h1>
      <p className="mt-2 text-sm text-gray-600">{t("today.checkin.sub")}</p>

      <div className="mt-8">
        <CheckInForm onSubmit={submit} />
      </div>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x max-w-xl py-10 pb-28 sm:py-14">{children}</div>
  );
}
