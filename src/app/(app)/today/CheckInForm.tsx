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
      className="space-y-9"
      onSubmit={(event) => {
        event.preventDefault();
        if (mood === null) return;
        onSubmit({ mood, sleepHours, note: note.trim() });
      }}
    >
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-gray-700">
          {t("today.mood.legend")}
        </legend>
        <MoodScale value={mood} onChange={setMood} />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-gray-700">
          {t("today.sleep.legend")}
        </legend>
        <SleepSlider value={sleepHours} onChange={setSleepHours} />
      </fieldset>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">
          {t("today.note.legend")}
        </p>
        <NoteField value={note} onChange={setNote} />
      </div>

      <button
        type="submit"
        disabled={mood === null}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("today.submit")}
      </button>
    </form>
  );
}
