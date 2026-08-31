"use client";

import { useState } from "react";
import { useT } from "@/i18n";
import { MoodScale } from "./MoodScale";
import { SleepSlider } from "./SleepSlider";
import { NoteField } from "./NoteField";
import type { MoodValue } from "./storage";

export type CheckInDraft = {
  mood: MoodValue;
  sleepHours: number;
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
}: {
  onSubmit: (draft: CheckInDraft) => void;
}) {
  const t = useT();
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [sleepHours, setSleepHours] = useState(DEFAULT_SLEEP);
  const [note, setNote] = useState("");

  return (
    <form
      className="animate-fade-up"
      onSubmit={(event) => {
        event.preventDefault();
        if (mood === null) return;
        onSubmit({ mood, sleepHours, note: note.trim() });
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

        <div>
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-earth/80">
            {t("today.note.legend")}
          </p>
          <NoteField value={note} onChange={setNote} />
        </div>
      </div>

      <button
        type="submit"
        disabled={mood === null}
        className="btn-primary mt-5 w-full shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {t("today.submit")}
      </button>
    </form>
  );
}
