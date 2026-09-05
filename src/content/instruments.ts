/**
 * DASS-21 items for the baseline step.
 *
 * The DASS was placed in the public domain by its authors (Lovibond & Lovibond,
 * 1995), so the English wording below is the published item text, used as-is.
 * Item ids match the published numbering, which is what the subscale mapping in
 * backend/app/modules/screening/scoring.py keys off — do not renumber them.
 *
 * The Bengali strings are WORKING TRANSLATIONS made for development. They have
 * not been psychometrically validated, and a score computed from them is not a
 * clinical result. See BANGLA_DASS21_VALIDATED below.
 */
export type Dass21Item = {
  /** Stable id — matches the item's number in the published DASS-21. */
  id: string;
  en: string;
  bn: string;
};

/**
 * False until a published, validated Bangla DASS-21 replaces the translations
 * below. The backend records this on every `bn` scoring run so a score derived
 * from an unvalidated instrument can never be mistaken for a clinical one.
 *
 * Flipping this to true requires replacing the `bn` strings with a validated
 * instrument — not merely improving the wording.
 */
export const BANGLA_DASS21_VALIDATED = false;

export const DASS21: Dass21Item[] = [
  {
    id: "dass-1",
    en: "I found it hard to wind down.",
    bn: "নিজেকে শান্ত করা আমার পক্ষে কঠিন লাগছিল।",
  },
  {
    id: "dass-2",
    en: "I was aware of dryness of my mouth.",
    bn: "মুখ শুকিয়ে যাচ্ছে বলে টের পাচ্ছিলাম।",
  },
  {
    id: "dass-3",
    en: "I couldn't seem to experience any positive feeling at all.",
    bn: "মনে হচ্ছিল যেন কোনো ইতিবাচক অনুভূতিই আমার হচ্ছে না।",
  },
  {
    id: "dass-4",
    en: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion).",
    bn: "শ্বাস নিতে অসুবিধা হচ্ছিল (যেমন খুব দ্রুত শ্বাস, পরিশ্রম ছাড়াই হাঁপ ধরা)।",
  },
  {
    id: "dass-5",
    en: "I found it difficult to work up the initiative to do things.",
    bn: "কোনো কাজ শুরু করার তাগিদ জোগাড় করা আমার পক্ষে কঠিন লাগছিল।",
  },
  {
    id: "dass-6",
    en: "I tended to over-react to situations.",
    bn: "যেকোনো পরিস্থিতিতে আমি প্রয়োজনের চেয়ে বেশি প্রতিক্রিয়া দিয়ে ফেলছিলাম।",
  },
  {
    id: "dass-7",
    en: "I experienced trembling (e.g. in the hands).",
    bn: "শরীর কাঁপছিল (যেমন হাত কাঁপা)।",
  },
  {
    id: "dass-8",
    en: "I felt that I was using a lot of nervous energy.",
    bn: "মনে হচ্ছিল আমি অনেকটা স্নায়ুর জোর খরচ করে ফেলছি।",
  },
  {
    id: "dass-9",
    en: "I was worried about situations in which I might panic and make a fool of myself.",
    bn: "ভয় হচ্ছিল এমন পরিস্থিতিতে পড়ব যেখানে ঘাবড়ে গিয়ে বোকা বনে যাব।",
  },
  {
    id: "dass-10",
    en: "I felt that I had nothing to look forward to.",
    bn: "মনে হচ্ছিল সামনে অপেক্ষা করার মতো কিছুই নেই।",
  },
  {
    id: "dass-11",
    en: "I found myself getting agitated.",
    bn: "টের পাচ্ছিলাম আমি অস্থির হয়ে উঠছি।",
  },
  {
    id: "dass-12",
    en: "I found it difficult to relax.",
    bn: "নিজেকে হালকা করা আমার পক্ষে কঠিন লাগছিল।",
  },
  {
    id: "dass-13",
    en: "I felt down-hearted and blue.",
    bn: "মন ভার আর বিষণ্ণ লাগছিল।",
  },
  {
    id: "dass-14",
    en: "I was intolerant of anything that kept me from getting on with what I was doing.",
    bn: "যা কিছু আমার কাজে বাধা দিচ্ছিল, কোনোটাই সহ্য করতে পারছিলাম না।",
  },
  {
    id: "dass-15",
    en: "I felt I was close to panic.",
    bn: "মনে হচ্ছিল আমি প্রায় আতঙ্কিত হয়ে পড়ছি।",
  },
  {
    id: "dass-16",
    en: "I was unable to become enthusiastic about anything.",
    bn: "কোনো কিছু নিয়েই উৎসাহ পাচ্ছিলাম না।",
  },
  {
    id: "dass-17",
    en: "I felt I wasn't worth much as a person.",
    bn: "মনে হচ্ছিল মানুষ হিসেবে আমার তেমন কোনো মূল্য নেই।",
  },
  {
    id: "dass-18",
    en: "I felt that I was rather touchy.",
    bn: "মনে হচ্ছিল আমি একটু বেশিই স্পর্শকাতর হয়ে আছি।",
  },
  {
    id: "dass-19",
    en: "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat).",
    bn: "পরিশ্রম ছাড়াই হৃৎপিণ্ডের ধুকপুক টের পাচ্ছিলাম (যেমন বুক ধড়ফড়, একটা বিট বাদ পড়া)।",
  },
  {
    id: "dass-20",
    en: "I felt scared without any good reason.",
    bn: "কোনো স্পষ্ট কারণ ছাড়াই ভয় লাগছিল।",
  },
  {
    id: "dass-21",
    en: "I felt that life was meaningless.",
    bn: "মনে হচ্ছিল জীবনটার কোনো মানে নেই।",
  },
];

/**
 * The published instrument length. Now equal to DASS21.length — the counter
 * used to read "1 / 21" while only three items existed.
 */
export const DASS21_TOTAL = 21;
