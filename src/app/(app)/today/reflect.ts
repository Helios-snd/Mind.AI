import type { Keys } from "@/i18n/en";
import type { MoodValue } from "./storage";

/**
 * Fixture stand-in for the COMPANION agent's acknowledgement.
 *
 * Picks a scripted reflection and at most one suggested action from a few
 * observable signals (a mentioned exam, a short night, a low mood). The real
 * thing reads the note and reflects back something genuinely specific.
 *
 * TODO(backend): replace with the COMPANION response; SAFETY may pre-empt this
 * entirely with an escalation view.
 */
export type Reflection = {
  ackKey: Keys;
  suggestion: { titleKey: Keys; bodyKey: Keys } | null;
};

const EXAM_HINTS = [
  /\bexams?\b/i,
  /\bviva\b/i,
  /\bresults?\b/i,
  /\bassignments?\b/i,
  /\bdeadlines?\b/i,
  /পরীক্ষা/,
  /পড়া/,
];

export function reflect(entry: {
  mood: MoodValue;
  sleepHours: number;
  note: string;
}): Reflection {
  const { mood, sleepHours, note } = entry;

  if (EXAM_HINTS.some((re) => re.test(note))) {
    return {
      ackKey: "today.ack.exam",
      suggestion: {
        titleKey: "today.suggest.reframe.title",
        bodyKey: "today.suggest.reframe.body",
      },
    };
  }

  if (sleepHours > 0 && sleepHours < 5) {
    return {
      ackKey: "today.ack.lowSleep",
      suggestion: {
        titleKey: "today.suggest.sleep.title",
        bodyKey: "today.suggest.sleep.body",
      },
    };
  }

  if (mood <= 2) {
    return {
      ackKey: "today.ack.lowMood",
      suggestion: {
        titleKey: "today.suggest.activation.title",
        bodyKey: "today.suggest.activation.body",
      },
    };
  }

  if (mood === 3) {
    return {
      ackKey: "today.ack.midMood",
      suggestion: {
        titleKey: "today.suggest.grounding.title",
        bodyKey: "today.suggest.grounding.body",
      },
    };
  }

  return { ackKey: "today.ack.goodMood", suggestion: null };
}
