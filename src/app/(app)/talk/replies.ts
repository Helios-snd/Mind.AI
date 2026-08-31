import type { Keys } from "@/i18n/en";

/**
 * Fixture stand-in for the COMPANION agent.
 *
 * Matches a handful of vernacular / somatic distress cues in either language
 * (the student can mix languages) and returns a warm, non-diagnostic reply key.
 * It never names a condition and never mentions medication — those are hard
 * constraints the real agent also holds.
 *
 * TODO(backend): replace with the streamed COMPANION response over full history.
 */
const RULES: { test: RegExp; key: Keys }[] = [
  {
    test: /\b(hi+|hey|hello|yo)\b|হ্যালো|হাই|নমস্কার|কেমন আছ/i,
    key: "talk.reply.greeting",
  },
  {
    test: /ghabra|ghabrahat|bechain|becheni|anxious|anxiety|nervous|panic|restless|on edge|ঘাবড়|বেচেন|উদ্বেগ|অস্থির|টেনশন/i,
    key: "talk.reply.anxiety",
  },
  {
    test: /chest|breath|breathe|heart (is )?racing|palpitation|tight|heavy chest|buke|বুকে|শ্বাস|হৃৎ|ধড়ফড়/i,
    key: "talk.reply.somatic",
  },
  {
    test: /nothing (feels|is) (good|right)|kichu bhalo|kichhu bhalo|bhalo lagche na|don'?t enjoy|numb|empty|hopeless|pointless|কিছু ভালো লাগছে না|ভালো লাগছে না|শূন্য|ফাঁকা/i,
    key: "talk.reply.lowMood",
  },
  {
    test: /sleep|insomnia|can'?t sleep|awake|tired all|exhaust|ঘুম|নিদ্রা|ক্লান্ত/i,
    key: "talk.reply.sleep",
  },
  {
    test: /exam|test|viva|result|assignment|deadline|semester|submission|পরীক্ষা|পড়া|রেজাল্ট/i,
    key: "talk.reply.exam",
  },
  {
    test: /lonely|alone|no one|nobody|isolated|left out|একা|নিঃসঙ্গ|কেউ নেই/i,
    key: "talk.reply.lonely",
  },
  {
    test: /thank|thanks|thx|ty\b|ধন্যবাদ|থ্যাংক/i,
    key: "talk.reply.thanks",
  },
];

export function replyKeyFor(text: string, userTurn: number): Keys {
  for (const rule of RULES) {
    if (rule.test.test(text)) return rule.key;
  }
  return userTurn % 2 === 0 ? "talk.reply.default2" : "talk.reply.default";
}
