import type { Keys } from "./en";

/**
 * Bengali key map. Typed as `satisfies Record<Keys, string>` — remove or misname
 * a key and `tsc --noEmit` fails.
 *
 * Register: informal তুমি, matching the product voice. Strings marked with the
 * spec are the client-supplied wording and must not be softened.
 */
export const bn = {
  // Shared
  "action.back": "পিছনে",
  "action.continue": "এগিয়ে যাও",
  "action.close": "বন্ধ করো",
  "action.retry": "আবার চেষ্টা করো",
  "state.loading": "একটু সময় দাও।",
  "state.empty": "এখনও কিছু নেই।",
  "state.error": "কিছু একটা লোড হয়নি। আবার চেষ্টা করতে পারো।",

  // Onboarding — Step 1: language
  "onboarding.language.heading":
    "প্রথমে বলো, কোন ভাষায় তোমার সবচেয়ে সহজ লাগে?",
  "onboarding.language.subline":
    "যেকোনো সময় বদলাতে পারো, আর কথা বলার সময় ভাষা মিশিয়েও বলতে পারো।",
  "onboarding.language.english": "English",
  "onboarding.language.bengali": "বাংলা",

  // Onboarding — Step 2: baseline
  "onboarding.baseline.heading":
    "কয়েকটা প্রশ্ন, যাতে আমি বুঝতে পারি তোমার জন্য স্বাভাবিক কেমন।",
  "onboarding.baseline.subline":
    "এটা কোনো পরীক্ষা নয়। ভুল উত্তর বলে কিছু নেই, আর এটা আর কেউ দেখবে না।",
  "onboarding.baseline.counter": "{current} / {total}",
  "onboarding.baseline.answer.0": "কখনও না",
  "onboarding.baseline.answer.1": "মাঝে মাঝে",
  "onboarding.baseline.answer.2": "প্রায়ই",
  "onboarding.baseline.answer.3": "প্রায় সব সময়",

  // Onboarding — Step 3: consent
  "onboarding.consent.heading": "এগিয়ে যাওয়ার আগে।",
  "onboarding.consent.line.stored":
    "তুমি এখানে যা লেখো তা জমা রাখা হয়, যাতে সময়ের সঙ্গে আমি প্যাটার্ন খেয়াল করতে পারি।",
  "onboarding.consent.line.readDelete":
    "আমি যা জমা রেখেছি তার সবকিছু তুমি পড়তে পারো, আর যেকোনো সময় যেকোনো অংশ মুছে ফেলতে পারো।",
  "onboarding.consent.line.ai":
    "আমি একটা এআই। যখন কোনো কিছু আমার সাহায্যের বাইরে চলে যাবে, আমি সৎভাবে তোমাকে বলে দেব।",
  "onboarding.consent.line.college":
    "তোমার কলেজ কখনও তোমার কথোপকথন পড়ে না।",
  "onboarding.consent.checkbox": "আমি পড়েছি এবং এগিয়ে যেতে রাজি।",
  "onboarding.consent.disclosure.summary": "ঠিক কী কী জমা রাখা হয়?",
  "onboarding.consent.disclosure.body":
    "তোমার ভাষার পছন্দ, এইমাত্র করা প্রশ্নগুলোর উত্তর, তুমি যেদিন এতে রাজি হচ্ছ সেই তারিখ, আর পরের স্ক্রিনে তুমি যে পরিকল্পনা ও যোগাযোগ লিখবে। এর বাইরে কিছু এই অ্যাপের বাইরে যায় না।",

  // Onboarding — Step 4: crisis plan and trusted contact
  "onboarding.crisis.heading": "শেষ একটা কথা, আর এটা জরুরি।",
  "onboarding.crisis.subline":
    "শান্ত থাকতে থাকতেই লিখে রাখো। কঠিন দিনে আমি তোমার নিজের কথাগুলোই তোমাকে দেখাব।",
  "onboarding.crisis.q1.label": "কার সঙ্গে তুমি কথা বলতে চাইবে?",
  "onboarding.crisis.q1.placeholder":
    "রিয়া। আর খুব খারাপ লাগলে দিদি।",
  "onboarding.crisis.q2.label": "কী তোমাকে সাহায্য করে?",
  "onboarding.crisis.q2.placeholder":
    "লেকের ধারে হাঁটা। মুখে ঠান্ডা জল। ঘর থেকে বেরিয়ে আসা।",
  "onboarding.crisis.q3.label": "কী পরিস্থিতি আরও খারাপ করে?",
  "onboarding.crisis.q3.placeholder":
    "সারা সন্ধে একা থাকা। স্ক্রল করা। খাবার বাদ দেওয়া।",
  "onboarding.crisis.contact.heading":
    "আর এমন একজন, যার কাছে আমি পৌঁছাতে পারি, যদি খারাপ সময়ে তুমি কখনও চুপ হয়ে যাও।",
  "onboarding.crisis.contact.name": "নাম",
  "onboarding.crisis.contact.relationship": "সম্পর্ক",
  "onboarding.crisis.contact.phone": "ফোন",
  "onboarding.crisis.contact.helper":
    "সম্পূর্ণ তোমার পছন্দ — বন্ধু, ভাইবোন, রুমমেট, যে কেউ। পরিবারের কেউ হতেই হবে এমন নয়।",
  "onboarding.crisis.contact.emergencyDisclosure":
    "একটা কথা জেনে রাখো: Mind.AI সাধারণত যেভাবে কাজ করে, এটা তার একমাত্র ব্যতিক্রম। তুমি যদি কখনও তাৎক্ষণিক বিপদে থাকো আর কয়েক মিনিটের মধ্যে সাড়া না দাও, আমরা নিজেরাই এই মানুষটির সঙ্গে যোগাযোগ করতে পারি। এটা শুধু ওই একটা পরিস্থিতিতেই হয় — অন্য কখনও নয়, আর তুমি নিজে দেখার আগে কখনও নয়।",
  "onboarding.crisis.error.required": "শেষ করার আগে এটা দরকার।",
  "onboarding.crisis.error.phone":
    "সংখ্যাসহ একটা ফোন নম্বর দাও। স্পেস আর +৯১ থাকলেও চলবে।",
  "onboarding.crisis.submit": "জমা দিয়ে শেষ করো",

  // Onboarding — Step 5: keep your account
  "onboarding.progress.label": "ধাপ {current} / {total}",
  "onboarding.claim.heading": "এটা রেখে দিতে চাও?",
  "onboarding.claim.subline":
    "এখন সবকিছু শুধু এই ফোনেই আছে। একটা ইমেল বা নম্বর দিয়ে রাখলে যেকোনো ডিভাইস থেকে আবার শুরু করতে পারবে।",
  "onboarding.claim.label": "ইমেল বা ফোন",
  "onboarding.claim.placeholder": "you@college.edu, বা ৯৮৭৬৫ ৪৩২১০",
  "onboarding.claim.send": "আমাকে একটা কোড পাঠাও",
  "onboarding.claim.codeLabel": "যে কোডটা পাঠানো হয়েছে",
  "onboarding.claim.codePlaceholder": "৬ সংখ্যা",
  "onboarding.claim.verify": "নিশ্চিত করো",
  "onboarding.claim.skip": "এখন না",
  "onboarding.claim.skipNote":
    "পরে প্রোফাইল থেকেও যোগ করতে পারবে। এখন বাদ দিলে কিছুই হারাবে না।",
  "onboarding.claim.sent": "পাঠানো হয়েছে। মেসেজ দেখে নাও।",
  "onboarding.claim.error.destination": "একটা ইমেল বা ফোন নম্বর দাও।",
  "onboarding.claim.error.code": "কোডটা ঠিক হয়নি। আবার চেষ্টা করো।",
  "onboarding.claim.error.taken":
    "এটা আগে থেকেই অন্য একটা অ্যাকাউন্টের সঙ্গে যুক্ত।",
  "onboarding.claim.devCode": "শুধু ডেভেলপমেন্টের জন্য — তোমার কোড {code}",

  // Need help now — button
  "help.button": "এখনই সাহায্য দরকার",

  // Need help now — sheet
  "help.heading": "এখনই সাহায্য দরকার",

  "help.telemanas.title": "টেলি-মানস-এ ফোন করো — ১৪৪১৬",
  "help.telemanas.subtitle": "বিনামূল্যে, ২৪ ঘণ্টা, বাংলা বা ইংরেজিতে।",

  "help.contact.title": "{name} কে বার্তা পাঠাও",
  "help.contact.titleUnnamed": "তুমি যাকে বেছেছ তাকে বার্তা পাঠাও",
  "help.contact.subtitle": "তুমি যাকে বেছেছ।",
  "help.contact.disabledSubtitle": "আগে তোমার প্রোফাইলে একজনকে যোগ করো।",
  "help.contact.messageLabel": "তোমার বার্তা",
  "help.contact.prefill":
    "আমি এখন ঠিক নেই, আর কাকে বলব বুঝতে পারছিলাম না। একটু ফোন করবি?",
  "help.contact.send": "পাঠাও",
  "help.contact.copy": "বার্তাটা কপি করো",
  "help.contact.copied": "কপি হয়েছে",

  "help.plan.title": "আমার পরিকল্পনা দেখাও",
  "help.plan.subtitle": "শান্ত একটা দিনে তুমি যা লিখেছিলে।",
  "help.plan.empty": "তুমি এখনও কোনো পরিকল্পনা লেখোনি।",

  "help.stay.title": "শুধু আমার পাশে থাকো",
  "help.stay.subtitle": "কোনো ফোন নয়। আমি এখানেই আছি।",

  // Help Now — calming mode ("শুধু আমার পাশে থাকো"-র গন্তব্য)
  "help.calming.intro": "চলো, একটু ধীরে করি।",
  "help.calming.inhale": "শ্বাস নাও — ৪ সেকেন্ড",
  "help.calming.hold": "ধরে রাখো — ২ সেকেন্ড",
  "help.calming.exhale": "শ্বাস ছাড়ো — ৬ সেকেন্ড",
  "help.calming.repeat": "যতক্ষণ ভালো লাগে, কয়েকবার করো।",
  "help.calming.grounding": "অথবা, চারপাশে দেখা যায় এমন ৩টা জিনিস খেয়াল করো।",
  "help.calming.back": "হেল্প নাউ-এ ফিরে যাও",

  // Navigation
  "nav.label": "প্রধান",
  "nav.today": "আজ",
  "nav.talk": "কথা বলো",
  "nav.trends": "প্রবণতা",
  "nav.me": "আমি",

  // Authenticated stub screens
  "today.heading": "আজ",
  "today.body": "তোমার সেটআপ শেষ। প্রতিটা দিন এখান থেকেই শুরু হবে।",
  "talk.heading": "কথা বলো",
  "talk.body": "আমি এখানে আছি। যখন চাও শুরু করো।",

  // Talk — conversation
  "talk.disclosure.body":
    "প্রথমেই একটা কথা: আমি একটা এআই, মানুষ নই। যখন কিছু আমার সাধ্যের বাইরে যাবে, সৎভাবে বলব — আর একজন সত্যিকারের মানুষ সবসময় এক ট্যাপ দূরে, প্রতিটা স্ক্রিনের ওই বোতামটা।",
  "talk.disclosure.dismiss": "বুঝলাম",
  "talk.composer.placeholder": "মনে যা আছে লেখো",
  "talk.composer.send": "পাঠাও",
  "talk.composer.hint": "পাঠাতে Enter · নতুন লাইনে Shift + Enter",
  "talk.mic.start": "রেকর্ড",
  "talk.mic.stop": "থামাও",
  "talk.mic.cancel": "বাতিল",
  "talk.mic.recording": "শুনছি… {time}",
  "talk.mic.done":
    "রেকর্ড হয়েছে। কথা থেকে লেখায় রূপান্তর ব্যাকএন্ড যুক্ত হলে হবে — পাঠানোর আগে এখানে এডিট করে নাও।",
  "talk.mic.denied":
    "মাইক্রোফোনের অনুমতি বন্ধ আছে। ব্রাউজারের সেটিংসে চালু করো, নয়তো শুধু টাইপ করো।",
  "talk.typing": "লিখছে…",
  "talk.failed": "পাঠানো যায়নি।",
  "talk.retry": "আবার চেষ্টা করো",
  "talk.day.today": "আজ",
  "talk.day.yesterday": "গতকাল",

  // Today — daily check-in
  "today.checkin.heading": "আজ কেমন চলছে?",
  "today.checkin.sub": "মিনিটখানেকের ব্যাপার। কোনো উত্তরই ভুল নয়।",

  "today.mood.legend": "এই মুহূর্তে তোমার মন কেমন?",
  "today.mood.1": "খুব খারাপ",
  "today.mood.2": "খারাপ",
  "today.mood.3": "মাঝামাঝি কোথাও",
  "today.mood.4": "মোটামুটি ভালো",
  "today.mood.5": "বেশ ভালো",

  "today.energy.legend": "আজ শক্তি কেমন ছিল?",
  "today.energy.1": "একদম ফাঁকা লাগছিল",
  "today.energy.2": "কম",
  "today.energy.3": "চলে যাওয়ার মতো",
  "today.energy.4": "মোটামুটি ভালো",
  "today.energy.5": "অনেকটাই",

  "today.social.legend": "মানুষের সঙ্গে সময় কাটিয়েছ?",
  "today.social.1": "একাই ছিলাম",
  "today.social.2": "প্রায় না",
  "today.social.3": "একটু",
  "today.social.4": "বেশ কিছুটা",
  "today.social.5": "অনেকটা",

  "today.sleep.legend": "কতটা ঘুম হয়েছে?",
  "today.sleep.value": "মোটামুটি {hours} ঘণ্টা",
  "today.sleep.zero": "এক ঘণ্টারও কম",

  "today.appetite.legend": "\u0996\u09be\u0993\u09df\u09be\u09b0 \u09b0\u09c1\u099a\u09bf \u0995\u09c7\u09ae\u09a8 \u099b\u09bf\u09b2?",
  "today.appetite.1": "\u0995\u09bf\u099b\u09c1\u0987 \u0996\u09be\u0987\u09a8\u09bf \u09ac\u09b2\u09a4\u09c7 \u0997\u09c7\u09b2\u09c7",
  "today.appetite.2": "\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u0995\u09ae",
  "today.appetite.3": "\u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995",
  "today.appetite.4": "\u09ad\u09be\u09b2\u09cb",
  "today.appetite.5": "\u09ac\u09c7\u09b6 \u09ad\u09be\u09b2\u09cb",

  "today.activity.legend": "\u0995\u09cb\u09a5\u09be\u0993 \u09ac\u09c7\u09b0\u09bf\u09df\u09c7\u099b\u09bf\u09b2\u09c7?",
  "today.activity.1": "\u0998\u09b0\u09c7\u0987 \u099b\u09bf\u09b2\u09be\u09ae",
  "today.activity.2": "\u0996\u09c1\u09ac \u098f\u0995\u099f\u09be \u09a8\u09be",
  "today.activity.3": "\u0985\u09b2\u09cd\u09aa",
  "today.activity.4": "\u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf",
  "today.activity.5": "\u09ac\u09c7\u09b6 \u0998\u09cb\u09b0\u09be\u09ab\u09c7\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7",

  "today.note.legend": "মনে কী চলছে?",
  "today.note.placeholder": "যা কিছু। এক লাইনই যথেষ্ট।",
  "today.note.mic.start": "বরং বলে ফেলো",
  "today.note.mic.stop": "থামাও",
  "today.note.mic.cancel": "বাতিল",
  "today.note.mic.recording": "শুনছি… {time}",
  "today.note.mic.done":
    "রেকর্ড হয়েছে। কথা থেকে লেখায় রূপান্তর ব্যাকএন্ড যুক্ত হলে হবে — আপাতত এখানে লিখে বা এডিট করে নাও।",
  "today.note.mic.denied":
    "মাইক্রোফোনের অনুমতি বন্ধ আছে। ব্রাউজারের সেটিংসে চালু করতে পারো, নয়তো শুধু টাইপ করো।",

  "today.submit": "আজকের মতো এটুকুই",
  "today.submit.saving": "সেভ হচ্ছে\u2026",
  "today.submit.failed": "সেভ হয়নি। কানেকশন দেখে আবার চেষ্টা করো।",

  "today.back.title": "আবার দেখা হয়ে ভালো লাগল।",
  "today.back.body": "পিছনের কিছু পুষিয়ে নেওয়ার দরকার নেই। চলো শুধু আজকেরটা করি।",

  "today.done.heading": "লিখে রাখা হলো।",
  "today.handoff.body": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09a7\u09be\u09b0\u09be\u09df \u09a8\u09bf\u09df\u09c7 \u09af\u09be\u099a\u09cd\u099b\u09bf\u2026",
  "today.done.seeTrends": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09a7\u09be\u09b0\u09be \u09a6\u09c7\u0996\u09cb",
  "today.done.addMore": "আরও কিছু যোগ করো",

  "today.ack.exam":
    "পরীক্ষা এলে যেন সব জায়গা নিয়ে নেয়। এটা খেয়াল করা স্বাভাবিক।",
  "today.ack.lowSleep":
    "কম ঘুমের রাত পরের দিনটাকে ভারী করে দেয়। নিজের সঙ্গে একটু নরম থেকো।",
  "today.ack.lowMood":
    "মনে হচ্ছে দিনটা ভারী গেছে। তাও যে জানালে, তার জন্য ধন্যবাদ।",
  "today.ack.midMood": "একটা মাঝামাঝি দিন। সেগুলোও গোনায় ধরা হয়।",
  "today.ack.goodMood": "শুনে ভালো লাগল যে আজ একটু স্থির লাগছে।",
  "today.ack.noted": "কথাগুলো লিখে জানানোর জন্য ধন্যবাদ — আমি রেখে দিলাম।",

  "today.suggest.label": "চাইলে ছোট্ট একটা কাজ",
  "today.suggest.sleep.title": "আজ রাতে ধীরে গোছানো",
  "today.suggest.sleep.body":
    "একটা সময় ঠিক করো যখন ফোন রেখে দেবে, আর ঘুমের আগের আধ ঘণ্টা আলো কমিয়ে রাখো।",
  "today.suggest.activation.title": "ছোট, করা যায় এমন একটা কাজ",
  "today.suggest.activation.body":
    "দশ মিনিটে হয় এমন কিছু বেছে নাও — একটু হাঁটা, স্নান, একজনকে উত্তর দেওয়া — আর শুধু সেটুকুই করো।",
  "today.suggest.grounding.title": "ধীর একটা মিনিট",
  "today.suggest.grounding.body":
    "পাঁচটা জিনিস যা দেখতে পাচ্ছ, চারটে যা শুনতে পাচ্ছ, তিনটে যা ছুঁয়ে অনুভব করছ — নাম বলো। তাড়া নেই।",
  "today.suggest.reframe.title": "কাগজে লিখে ফেলো",
  "today.suggest.reframe.body":
    "দুশ্চিন্তাটা এক লাইনে লেখো, তারপর লেখো কোনো বন্ধু একই কথা বললে তুমি তাকে কী বলতে।",

  // Trends — the mood meter
  "trends.heading": "প্রবণতা",
  "trends.sub": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09a8\u09bf\u099c\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09a4\u09be\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u2014 \u0985\u09a8\u09cd\u09af \u0995\u09be\u09b0\u09cb \u09b8\u0999\u09cd\u0997\u09c7 \u09a8\u09df\u0964",

  // Range selector
  "trends.range.7d": "\u09ed \u09a6\u09bf\u09a8",
  "trends.range.4w": "\u09ea \u09b8\u09aa\u09cd\u09a4\u09be\u09b9",
  "trends.range.6w": "\u09ec \u09b8\u09aa\u09cd\u09a4\u09be\u09b9",
  "trends.rangeLabel": "\u0995\u09a4\u09a6\u09bf\u09a8 \u09aa\u09bf\u099b\u09a8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09a6\u09c7\u0996\u09ac\u09c7",

  // Per-series card
  "trends.average": "\u0997\u09a1\u09bc",
  "trends.stat.average": "\u0997\u09a1\u09bc",
  "trends.stat.highest": "\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a",
  "trends.stat.lowest": "\u09b8\u09b0\u09cd\u09ac\u09a8\u09bf\u09ae\u09cd\u09a8",
  "trends.stat.change": "\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8",
  "trends.stat.changeFlat": "\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b9\u09df\u09a8\u09bf",
  "trends.stat.dash": "\u2014",
  "trends.usual": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995",
  "trends.usualRange": "{low}\u2013{high}",
  "trends.latest": "\u09b8\u09b0\u09cd\u09ac\u09b6\u09c7\u09b7",
  "trends.noBaselineYet":
    "\u099a\u09c7\u0995-\u0987\u09a8 \u099a\u09be\u09b2\u09bf\u09df\u09c7 \u0997\u09c7\u09b2\u09c7 \u09a4\u09cb\u09ae\u09be\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09aa\u09b0\u09bf\u09b8\u09b0\u099f\u09be \u098f\u0996\u09be\u09a8\u09c7 \u09a6\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7\u0964",
  "trends.single.early": "\u098f\u0987\u09ae\u09be\u09a4\u09cd\u09b0 \u09b6\u09c1\u09b0\u09c1 \u09b9\u09b2\u09cb \u2014 \u098f\u0996\u09a8\u0993 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u098f\u0995\u099f\u09be\u0987 \u099a\u09c7\u0995-\u0987\u09a8\u0964",
  "trends.single.reference": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b6\u09c1\u09b0\u09c1\u09b0 \u099c\u09be\u09df\u0997\u09be \u099b\u09bf\u09b2 {value}\u0964",
  "trends.notEnoughSeries":
    "\u098f\u099f\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u0996\u09a8\u09cb \u09af\u09a5\u09c7\u09b7\u09cd\u099f \u099a\u09c7\u0995-\u0987\u09a8 \u09b9\u09df\u09a8\u09bf\u0964",

  // Observations
  "trends.obs.belowBaseline":
    "\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u09b8\u09ae\u09df\u09c7 \u09a4\u09cb\u09ae\u09be\u09b0 {series} \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09aa\u09b0\u09bf\u09b8\u09b0\u09c7\u09b0 \u09a8\u09bf\u099a\u09c7 \u099b\u09bf\u09b2\u0964",
  "trends.obs.aboveBaseline":
    "\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u09b8\u09ae\u09df\u09c7 \u09a4\u09cb\u09ae\u09be\u09b0 {series} \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09aa\u09b0\u09bf\u09b8\u09b0\u09c7\u09b0 \u0989\u09aa\u09b0\u09c7 \u099b\u09bf\u09b2\u0964",
  "trends.obs.withinBaseline":
    "\u09a4\u09cb\u09ae\u09be\u09b0 {series} \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09aa\u09b0\u09bf\u09b8\u09b0\u09c7\u0987 \u099b\u09bf\u09b2\u0964",
  "trends.obs.declining":
    "\u098f\u0987 \u09b8\u09ae\u09df\u099f\u09be\u09df \u09a4\u09cb\u09ae\u09be\u09b0 {series} \u0995\u09ae\u09c7 \u098f\u09b8\u09c7\u099b\u09c7\u0964",
  "trends.obs.rising":
    "\u098f\u0987 \u09b8\u09ae\u09df\u099f\u09be\u09df \u09a4\u09cb\u09ae\u09be\u09b0 {series} \u09ac\u09be\u09a1\u09bc\u099b\u09c7\u0964",
  "trends.obs.steady":
    "\u09a4\u09cb\u09ae\u09be\u09b0 {series} \u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae \u099b\u09bf\u09b2\u0964",

  // Tips
  "trends.tip.mood":
    "\u0996\u09be\u09b0\u09be\u09aa \u09b8\u09ae\u09df\u09c7 \u09ae\u09a8 \u09ac\u09a6\u09b2\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u0985\u09aa\u09c7\u0995\u09cd\u09b7\u09be \u0995\u09b0\u09be\u09b0 \u099a\u09c7\u09df\u09c7 \u099b\u09cb\u099f \u098f\u0995\u099f\u09be \u0995\u09be\u099c \u0995\u09b0\u09be \u09ac\u09c7\u09b6\u09bf \u0995\u09be\u099c\u09c7 \u09a6\u09c7\u09df\u0964",
  "trends.tip.sleep":
    "\u0998\u09c1\u09ae\u09c7\u09b0 \u09b8\u09ae\u09df \u0986\u09b0\u09c7\u0995\u099f\u09c1 \u09a8\u09bf\u09df\u09ae\u09bf\u09a4 \u09b9\u09b2\u09c7 \u09b9\u09df\u09a4\u09cb \u09ac\u09c7\u09b6\u09bf \u09ac\u09bf\u09b6\u09cd\u09b0\u09be\u09ae \u09aa\u09be\u09ac\u09c7\u0964",
  "trends.tip.sleepConsistency":
    "\u0995\u09df\u09c7\u0995 \u09a6\u09bf\u09a8 \u0998\u09c1\u09ae\u09be\u09a4\u09c7 \u09af\u09be\u0993\u09df\u09be \u0986\u09b0 \u0993\u09a0\u09be\u09b0 \u09b8\u09ae\u09df \u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae \u09b0\u09be\u0996\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09cb\u0964",
  "trends.tip.energy":
    "\u0995\u09ae \u0998\u09c1\u09ae\u09c7\u09b0 \u09aa\u09b0 \u09b6\u0995\u09cd\u09a4\u09bf \u0995\u09ae\u09c7 \u09af\u09be\u0993\u09df\u09be \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u0964 \u0995\u09df\u09c7\u0995\u099f\u09be \u09a6\u09bf\u09a8 \u09a8\u09bf\u099c\u09c7\u09b0 \u0989\u09aa\u09b0 \u099a\u09be\u09aa \u0995\u09ae \u09a6\u09be\u0993\u0964",
  "trends.tip.social":
    "\u09af\u09be\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09b8\u09b9\u099c \u09b2\u09be\u0997\u09c7, \u09a4\u09be\u0995\u09c7 \u098f\u0995\u09ac\u09be\u09b0 \u09ac\u09b2\u09be\u09b0 \u0995\u09a5\u09be \u09ad\u09be\u09ac\u09a4\u09c7 \u09aa\u09be\u09b0\u09cb\u0964",
  "trends.tipLabel": "\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09be\u09b0 \u098f\u0995\u099f\u09be \u09b8\u09b9\u099c \u099c\u09be\u09df\u0997\u09be",

  // At a glance
  "trends.glance.heading": "\u098f\u0995 \u09a8\u099c\u09b0\u09c7",
  "trends.glance.noticing": "\u09af\u09be \u099a\u09cb\u0996\u09c7 \u09aa\u09a1\u09bc\u099b\u09c7",
  "trends.change.up": "{value} \u09ac\u09c7\u09a1\u09bc\u09c7\u099b\u09c7",
  "trends.change.down": "{value} \u0995\u09ae\u09c7\u099b\u09c7",
  "trends.change.none": "\u09aa\u09cd\u09b0\u09be\u09df \u098f\u0995\u0987",
  "trends.change.new": "\u2014",

  // Cross-series summaries
  "trends.summary.sleepAndMood":
    "\u09b6\u09c7\u09b7 \u0995\u09df\u09c7\u0995\u099f\u09be \u099a\u09c7\u0995-\u0987\u09a8\u09c7 \u09a4\u09cb\u09ae\u09be\u09b0 \u0998\u09c1\u09ae \u0986\u09b0 \u09ae\u09a8 \u09a6\u09c1\u099f\u09cb\u0987 \u0995\u09ae\u09c7\u099b\u09c7\u0964",
  "trends.summary.socialAndMood":
    "\u09af\u09c7 \u09b8\u09ae\u09df\u09c7 \u09ae\u09be\u09a8\u09c1\u09b7\u09c7\u09b0 \u09b8\u0999\u09cd\u0997 \u0995\u09ae\u09c7\u099b\u09c7, \u09b8\u09c7\u0987 \u09b8\u09ae\u09df\u09c7\u0987 \u09a4\u09cb\u09ae\u09be\u09b0 \u09ae\u09a8\u0993 \u0995\u09ae \u099b\u09bf\u09b2\u0964",
  "trends.summary.sleep":
    "\u0987\u09a6\u09be\u09a8\u09c0\u0982 \u09a4\u09cb\u09ae\u09be\u09b0 \u0998\u09c1\u09ae \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u0995\u09ae \u09b9\u099a\u09cd\u099b\u09c7\u0964",
  "trends.summary.mood":
    "\u0987\u09a6\u09be\u09a8\u09c0\u0982 \u09a4\u09cb\u09ae\u09be\u09b0 \u09ae\u09a8 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995 \u09aa\u09b0\u09bf\u09b8\u09b0\u09c7\u09b0 \u09a8\u09bf\u099a\u09c7 \u099b\u09bf\u09b2\u0964",
  "trends.summary.steady":
    "\u0987\u09a6\u09be\u09a8\u09c0\u0982 \u09ac\u09a1\u09bc \u0995\u09bf\u099b\u09c1 \u09ac\u09a6\u09b2\u09be\u09df\u09a8\u09bf \u2014 \u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae \u0986\u099b\u09c7\u0964",
  "trends.series.mood": "মন",
  "trends.series.sleep": "ঘুম",
  "trends.series.energy": "শক্তি",
  "trends.series.social": "মেলামেশা",
  "trends.dash.heading": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u09a7\u09be\u09b0\u09be",
  "trends.dash.sub": "\u09a4\u09c1\u09ae\u09bf \u09af\u09be \u099c\u09be\u09a8\u09bf\u09df\u09c7\u099b, \u09a4\u09be\u09b0 \u09ad\u09bf\u09a4\u09cd\u09a4\u09bf\u09a4\u09c7 \u09a4\u09cb\u09ae\u09be\u09b0 \u09a6\u09bf\u09a8\u0997\u09c1\u09b2\u09cb \u0995\u09c7\u09ae\u09a8 \u09af\u09be\u099a\u09cd\u099b\u09c7\u0964",
  "trends.metric.of5": "{value} / \u09eb",
  "trends.metric.hrs": "{value} \u0998\u09a8\u09cd\u099f\u09be",
  "trends.dir.rising": "\u09ac\u09be\u09a1\u09bc\u099b\u09c7",
  "trends.dir.declining": "\u0995\u09ae\u09c7\u099b\u09c7",
  "trends.dir.steady": "\u098f\u0995\u09b0\u0995\u09ae",
  "trends.dir.unknown": "\u098f\u0996\u09a8\u09cb \u0995\u09ae \u09a4\u09a5\u09cd\u09af",

  "trends.compare.heading": "\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 {series}",
  "trends.compare.recent": "\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u0997\u09a1\u09bc",
  "trends.compare.baseline": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995",
  "trends.compare.above": "\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 {value} \u09ac\u09c7\u09b6\u09bf",
  "trends.compare.below": "\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 {value} \u0995\u09ae",
  "trends.compare.around": "\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995\u09c7\u09b0 \u0986\u09b6\u09aa\u09be\u09b6\u09c7",

  "trends.snapshot.heading": "\u09a4\u09cb\u09ae\u09be\u09b0 \u099a\u09c7\u0995-\u0987\u09a8 \u09b8\u09cd\u09a8\u09cd\u09af\u09be\u09aa\u09b6\u099f",
  "trends.snapshot.sub": "\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995\u09c7 \u09a4\u09c1\u09ae\u09bf \u0995\u09c0 \u09b2\u09bf\u0996\u099b, \u09a4\u09be\u09b0 \u098f\u0995 \u099d\u09b2\u0995 \u09a6\u09c3\u09b6\u09cd\u09af\u0964",

  "trends.snapshot.checkins.label": "\u099a\u09c7\u0995-\u0987\u09a8",
  "trends.snapshot.checkins.value": "{logged} / {total}",
  "trends.snapshot.checkins.caption": "\u0997\u09a4 {total} \u09a6\u09bf\u09a8\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 {logged} \u09a6\u09bf\u09a8 \u09a4\u09c1\u09ae\u09bf \u099a\u09c7\u0995-\u0987\u09a8 \u0995\u09b0\u09c7\u099b\u0964",

  "trends.snapshot.gettingOut.label": "\u09ac\u09be\u0987\u09b0\u09c7 \u09ac\u09c7\u09b0\u09cb\u09a8\u09cb",
  "trends.snapshot.gettingOut.value": "{positive} / {total}",
  "trends.snapshot.gettingOut.caption": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b6\u09c7\u09b7 {total} \u099f\u09be \u099a\u09c7\u0995-\u0987\u09a8 \u09a6\u09bf\u09a8\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 {positive} \u09a6\u09bf\u09a8 \u09ac\u09be\u0987\u09b0\u09c7 \u09ac\u09c7\u09b0\u09bf\u09df\u09c7\u099b\u09c7\u09be\u0964",
  "trends.snapshot.gettingOut.noneCaption": "\u099f\u09c1\u09a1\u09c7-\u098f \u0995\u09be\u09b0\u09cd\u09af\u0995\u09b2\u09be\u09aa \u09b2\u09bf\u0996\u09b2\u09c7 \u098f\u099f\u09be \u098f\u0996\u09be\u09a8\u09c7 \u09a6\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7\u0964",

  "trends.snapshot.appetite.label": "\u0996\u09be\u0993\u09df\u09be\u09b0 \u09b0\u09c1\u099a\u09bf",
  "trends.snapshot.appetite.none": "\u098f\u0996\u09a8\u09cb \u09af\u09a5\u09c7\u09b7\u09cd\u099f \u09b2\u09c7\u0996\u09be \u09b9\u09df\u09a8\u09bf",
  "trends.snapshot.appetite.caption": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u0996\u09be\u0993\u09df\u09be\u09b0 \u09b0\u09c1\u099a\u09bf\u09b0 \u09b2\u0997\u0964",
  "trends.snapshot.appetite.noneCaption": "\u0986\u09b0\u0993 \u0995\u09df\u09c7\u0995\u099f\u09be \u099a\u09c7\u0995-\u0987\u09a8 \u098f\u0996\u09be\u09a8\u09c7 \u098f\u0995\u099f\u09be \u09a7\u09be\u09b0\u09be \u09a6\u09c7\u0996\u09be\u09ac\u09c7\u0964",
  "trends.secondary.direction.rising": "\u09ac\u09be\u09a1\u09bc\u099b\u09c7",
  "trends.secondary.direction.declining": "\u0986\u0997\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u0995\u09ae",
  "trends.secondary.direction.steady": "\u09ae\u09cb\u099f\u09be\u09ae\u09c1\u099f\u09bf \u098f\u0995\u09b0\u0995\u09ae",
  "trends.secondary.activity.count": "{total} \u09a6\u09bf\u09a8\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 {positive} \u09a6\u09bf\u09a8 \u09ac\u09c7\u09b0\u09bf\u09df\u09c7\u099b",
  "trends.secondary.none": "\u098f\u0996\u09a8\u09cb \u09b2\u09c7\u0996\u09be \u09b9\u09df\u09a8\u09bf",

  "trends.start.heading": "\u09b6\u09c1\u09b0\u09c1\u09b0 \u099c\u09be\u09df\u0997\u09be",
  "trends.start.sub": "{date} \u09a4\u09be\u09b0\u09bf\u0996\u09c7 \u09af\u0996\u09a8 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c7\u099b\u09bf\u09b2\u09c7\u0964",
  "trends.start.baselineTaken": "\u09aa\u09cd\u09b0\u09a5\u09ae \u09aa\u09b0\u09cd\u09ac\u09c7\u09b0 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8\u0997\u09c1\u09b2\u09cb \u09a4\u09c1\u09ae\u09bf \u09b6\u09c7\u09b7 \u0995\u09b0\u09c7\u099b\u09bf\u09b2\u09c7\u0964",
  "trends.start.noValues": "\u09a4\u09cb\u09ae\u09be\u09b0 \u09aa\u09cd\u09b0\u09a5\u09ae \u09a6\u09bf\u0995\u09c7\u09b0 \u099a\u09c7\u0995-\u0987\u09a8 \u098f\u0996\u09be\u09a8\u09c7 \u09a4\u09c1\u09b2\u09a8\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u09a6\u09c7\u0996\u09be \u09af\u09be\u09ac\u09c7\u0964",
  "trends.start.then": "\u09a4\u0996\u09a8",
  "trends.start.now": "\u098f\u0996\u09a8",

  "trends.notes.heading": "\u09a4\u09c1\u09ae\u09bf \u09af\u09be \u09af\u09be \u09b2\u09bf\u0996\u09c7\u099b",
  "trends.notes.tooEarly": "\u0995\u09be\u099c\u09c7 \u09b2\u09be\u0997\u09be\u09b0 \u09ae\u09a4\u09cb \u09a7\u09be\u09b0\u09be \u09a6\u09c7\u0996\u09a4\u09c7 \u0986\u09b0\u0993 \u0995\u09df\u09c7\u0995\u099f\u09be \u099a\u09c7\u0995-\u0987\u09a8 \u09a6\u09b0\u0995\u09be\u09b0\u0964",
  "trends.action.heading": "\u099b\u09cb\u099f \u098f\u0995\u099f\u09be \u099a\u09c7\u09b7\u09cd\u099f\u09be",

  "trends.state.thin": "\u0986\u09b0\u0993 \u0995\u09df\u09c7\u0995\u099f\u09be \u099a\u09c7\u0995-\u0987\u09a8 \u09b9\u09b2\u09c7 \u09a7\u09be\u09b0\u09be\u099f\u09be \u09b8\u09cd\u09aa\u09b7\u09cd\u099f \u09b9\u09ac\u09c7\u0964",
  "trends.empty.cta": "\u099f\u09c1\u09a1\u09c7\u09a4\u09c7 \u09af\u09be\u0993",
  "trends.empty.title": "এখনও যথেষ্ট নয়।",
  "trends.empty.body": "সপ্তাহখানেক চেক-ইন করো, তাহলে এটা ভরতে শুরু করবে।",

  // Everything stored about you
  "data.heading": "তোমার সম্পর্কে যা কিছু জমা আছে",
  "data.intro":
    "এটাই পুরো রেকর্ড। যেকোনো অংশ তুমি মুছে ফেলতে পারো, আর তা একেবারে চলে যায়।",
  "data.back": "পিছনে",
  "data.notSet": "দেওয়া হয়নি",
  "data.delete": "মুছে ফেলো",
  "data.mood.1": "খুব খারাপ",
  "data.mood.2": "খারাপ",
  "data.mood.3": "মোটামুটি",
  "data.mood.4": "ভালো",
  "data.mood.5": "বেশ ভালো",
  "data.checkins.title": "দৈনিক চেক-ইন",
  "data.checkins.empty": "এখনও কোনো চেক-ইন নেই।",
  "data.checkins.summary": "মন {mood} · ঘুম {sleep}",
  "data.checkins.note": " · নোট রাখা হয়েছে",
  "data.convo.title": "কথোপকথন",
  "data.convo.count": "{count}টি বার্তা, শুরু {date}",
  "data.convo.empty": "এখনও কোনো কথোপকথন নেই।",
  "data.convo.delete": "কথোপকথন মুছে ফেলো",
  "data.setup.title": "তোমার সেটআপ",
  "data.setup.language": "ভাষা",
  "data.setup.baseline": "বেসলাইন উত্তর",
  "data.setup.baselineValue": "{count}টি জমা",
  "data.setup.consent": "শর্তে সম্মতি",
  "data.setup.plan": "সংকট পরিকল্পনা",
  "data.setup.plan.saved": "জমা আছে",
  "data.setup.plan.none": "এখনও লেখা হয়নি",
  "data.setup.contact": "বিশ্বস্ত যোগাযোগ",
  "data.setup.contact.none": "কেউ বেছে নেওয়া হয়নি",
  "data.setup.editHint": "এগুলো তোমার প্রোফাইলে গিয়ে বদলাও।",

  // Me — profile and controls
  "me.heading": "আমি",
  "me.sub": "তোমার সেটিংস, তোমার কথা, তোমার ডেটা।",
  "me.language.title": "ভাষা",
  "me.language.hindiSoon": "শীঘ্রই",
  "me.plan.title": "তোমার সংকট পরিকল্পনা",
  "me.plan.none": "তুমি এখনও কোনোটা লেখোনি।",
  "me.plan.edit": "এডিট করো",
  "me.plan.save": "সেভ করো",
  "me.plan.cancel": "বাতিল",
  "me.plan.saved": "সেভ হয়েছে",
  "me.contact.title": "বিশ্বস্ত যোগাযোগ",
  "me.contact.none": "এখনও কেউ বেছে নেওয়া হয়নি।",
  "me.contact.relationshipLine": "{relationship} · {phone}",
  "me.human.title": "যেকোনো সময়, একজন সত্যিকারের মানুষ",
  "me.human.row": "একজন সত্যিকারের মানুষের সঙ্গে কথা বলো",
  "me.human.always":
    "“এখনই সাহায্য দরকার” বোতামটা প্রতিটা স্ক্রিনে আছে — কখনও চলে যায় না।",
  "me.data.title": "তোমার ডেটা",
  "me.data.see": "আমার সম্পর্কে যা কিছু জমা আছে দেখো",
  "me.data.retention":
    "তুমি যা লেখো তা রাখা হয় যাতে সময়ের সঙ্গে প্যাটার্ন দেখা যায়। এই অ্যাপের বাইরে কিছু যায় না, আর তোমার কলেজ কখনও এটা পড়ে না।",
  "me.data.delete": "সব মুছে ফেলে নতুন করে শুরু করো",
  "me.delete.heading": "সবকিছু মুছে ফেলবে?",
  "me.delete.body":
    "এটা তোমার চেক-ইন, কথোপকথন, পরিকল্পনা, যোগাযোগ আর উত্তরগুলো এই ডিভাইস থেকে মুছে দেয়। এটা আর ফেরানো যায় না।",
  "me.delete.confirmLabel": "নিশ্চিত করতে DELETE লেখো",
  "me.delete.confirmWord": "DELETE",
  "me.delete.button": "সবকিছু মুছে ফেলো",
  "me.delete.cancel": "আমার ডেটা রেখে দাও",
  "me.delete.done": "হয়ে গেছে। সবকিছু মুছে ফেলা হয়েছে।",
  "human.heading": "একজন সত্যিকারের মানুষের সঙ্গে কথা বলো",
  "human.back": "পিছনে",
  "human.body": "অ্যাপের মধ্যে দিয়ে না গিয়েও তুমি একজন প্রশিক্ষিত কাউন্সেলরের কাছে পৌঁছাতে পারো।",
  "human.telemanas.title": "টেলি-মানস — ১৪৪১৬",
  "human.telemanas.body":
    "বিনামূল্যে, ২৪ ঘণ্টা, বাংলা বা ইংরেজিতে। একটা ফোন, কোনো রেফারেল লাগে না।",
  "human.counsellor.title": "তোমার ক্যাম্পাস কাউন্সেলর",
  "human.counsellor.body":
    "প্রতিটা ক্যাম্পাসে একজন আছেন। তুমি বললে অ্যাপ আগে তাঁকে একটা ছোট সারসংক্ষেপ পাঠাতে পারে — তবে শুধু তুমি যা অনুমোদন করবে, আর শুধু যখন তুমি প্রস্তুত।",

  // Escalation — the tier-2 interstitial
  "escalation.reason.trend_decline_mood":
    "তোমার মন-মেজাজ কিছুদিন ধরে তোমার স্বাভাবিক মাত্রার চেয়ে নিচে আছে। এক্ষেত্রে একজন কাউন্সেলর সাহায্য করতে পারেন।",
  "escalation.share.heading": "আমরা কী শেয়ার করব",
  "escalation.share.checkins": "তোমার সাম্প্রতিক চেক-ইনের ধরন",
  "escalation.share.talkMessages": "তোমার সাম্প্রতিক 'কথা বলো' বার্তা",
  "escalation.share.reason": "কেন সাহায্যের পরামর্শ দেওয়া হচ্ছে, তার কারণ",
  "escalation.share.nothingElse": "তোমার অ্যাকাউন্ট থেকে আর কিছু শেয়ার করা হবে না।",
  "escalation.approve": "হ্যাঁ, শেয়ার করো",
  "escalation.notNow": "এখন না",

  // Crisis screen — tier 3
  "crisis.heading": "চলো, এখনই তোমার জন্য সাহায্যের ব্যবস্থা করি",
  "crisis.humanReview":
    "পরের কর্মদিবসের মধ্যে একজন কাউন্সেলর তোমার সঙ্গে যোগাযোগ করবেন। তোমাকে আর কিছু করতে হবে না।",
  "crisis.back": "'কথা বলো'-তে ফিরে যাও",
  "crisis.countdown.label":
    "যদি আমরা তোমার থেকে সাড়া না পাই, তোমার বিশ্বস্ত মানুষটির সঙ্গে যোগাযোগ করব। তুমি ঠিক আছো জানাতে যেকোনো জায়গায় ট্যাপ করো, বা Cancel করো।",
  "crisis.countdown.cancel": "আমি ঠিক আছি — বাতিল করো",
} satisfies Record<Keys, string>;
