/**
 * DASS-21 items for the baseline step.
 *
 * The DASS was placed in the public domain by its authors (Lovibond & Lovibond,
 * 1995), so the English wording below is the published item text, used as-is.
 *
 * Only three items are wired up right now. The remaining eighteen are a TODO —
 * do NOT invent replacement items; copy the real published wording when adding
 * them, and keep the same 0..3 response frame.
 *
 * The Bengali strings are working translations for development. Replace them
 * with a validated Bangla DASS-21 before this is used with real students.
 */
export type Dass21Item = {
  /** Stable id — matches the item's number in the published DASS-21. */
  id: string;
  en: string;
  bn: string;
};

export const DASS21: Dass21Item[] = [
  {
    id: "dass-3",
    en: "I couldn't seem to experience any positive feeling at all.",
    bn: "মনে হচ্ছিল যেন কোনো ইতিবাচক অনুভূতিই আমার হচ্ছে না।",
  },
  {
    id: "dass-5",
    en: "I found it difficult to work up the initiative to do things.",
    bn: "কোনো কাজ শুরু করার তাগিদ জোগাড় করা আমার পক্ষে কঠিন লাগছিল।",
  },
  {
    id: "dass-10",
    en: "I felt that I had nothing to look forward to.",
    bn: "মনে হচ্ছিল সামনে অপেক্ষা করার মতো কিছুই নেই।",
  },
  // TODO: add the remaining 18 DASS-21 items (ids dass-1, dass-2, dass-4, ...)
  // using the published wording. Total item count stays 21 — see DASS21_TOTAL.
];

/**
 * The instrument is 21 items even while only three are implemented, so the
 * on-screen counter reads "1 / 21". Keep this as the denominator.
 */
export const DASS21_TOTAL = 21;
