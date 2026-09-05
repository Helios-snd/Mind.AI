"use client";

import { useState } from "react";
import { useT } from "@/i18n";
import { MoodScale } from "./MoodScale";
import { SleepSlider } from "./SleepSlider";
import { NoteField } from "./NoteField";
import {
  ACTIVITY_LABELS,
  APPETITE_LABELS,
  ENERGY_LABELS,
  SOCIAL_LABELS,
  SimpleScale,
} from "./SimpleScale";
import type { MoodValue, ScaleValue } from "./storage";

export type CheckInDraft = {
  mood: MoodValue;
  sleepHours: number;
  energy: ScaleValue | null;
  social: ScaleValue | null;
  appetite: ScaleValue | null;
  activity: ScaleValue | null;
  note: string;
};

const DEFAULT_SLEEP = 7;

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-earth/80">
      {children}
    </legend>
  );
}

export function CheckInForm({
  onSubmit,
  submitting = false,
  failed = false,
}: {
  onSubmit: (draft: CheckInDraft) => void;
  submitting?: boolean;
  failed?: boolean;
}) {
  const t = useT();
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [sleepHours, setSleepHours] = useState(DEFAULT_SLEEP);
  const [energy, setEnergy] = useState<ScaleValue | null>(null);
  const [social, setSocial] = useState<ScaleValue | null>(null);
  const [appetite, setAppetite] = useState<ScaleValue | null>(null);
  const [activity, setActivity] = useState<ScaleValue | null>(null);
  const [note, setNote] = useState("");

  return (
    <form
      className="animate-fade-up"
      onSubmit={(event) => {
        event.preventDefault();
        if (mood === null) return;
        onSubmit({
          mood,
          sleepHours,
          energy,
          social,
          appetite,
          activity,
          note: note.trim(),
        });
      }}
    >
      <div className="card space-y-8 p-5 sm:p-6">
        <fieldset>
          <Legend>{t("today.mood.legend")}</Legend>
          <MoodScale value={mood} onChange={setMood} />
        </fieldset>

        <fieldset>
          <Legend>{t("today.sleep.legend")}</Legend>
          <SleepSlider value={sleepHours} onChange={setSleepHours} />
        </fieldset>

        <fieldset>
          <Legend>{t("today.energy.legend")}</Legend>
          <SimpleScale
            value={energy}
            onChange={setEnergy}
            legendKey="today.energy.legend"
            labelKeys={ENERGY_LABELS}
          />
        </fieldset>

        <fieldset>
          <Legend>{t("today.social.legend")}</Legend>
          <SimpleScale
            value={social}
            onChange={setSocial}
            legendKey="today.social.legend"
            labelKeys={SOCIAL_LABELS}
          />
        </fieldset>

        <fieldset>
          <Legend>{t("today.appetite.legend")}</Legend>
          <SimpleScale
            value={appetite}
            onChange={setAppetite}
            legendKey="today.appetite.legend"
            labelKeys={APPETITE_LABELS}
          />
        </fieldset>

        <fieldset>
          <Legend>{t("today.activity.legend")}</Legend>
          <SimpleScale
            value={activity}
            onChange={setActivity}
            legendKey="today.activity.legend"
            labelKeys={ACTIVITY_LABELS}
          />
        </fieldset>

        <fieldset>
          <Legend>{t("today.note.legend")}</Legend>
          <NoteField value={note} onChange={setNote} />
        </fieldset>
      </div>

      {failed && (
        <p role="alert" className="mt-4 text-sm text-crisis">
          {t("today.submit.failed")}
        </p>
      )}

      <button
        type="submit"
        disabled={mood === null || submitting}
        className="btn-primary mt-5 w-full shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {submitting ? t("today.submit.saving") : t("today.submit")}
      </button>
    </form>
  );
}
