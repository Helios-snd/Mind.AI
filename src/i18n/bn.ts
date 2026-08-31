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
  "onboarding.crisis.error.required": "শেষ করার আগে এটা দরকার।",
  "onboarding.crisis.error.phone":
    "সংখ্যাসহ একটা ফোন নম্বর দাও। স্পেস আর +৯১ থাকলেও চলবে।",
  "onboarding.crisis.submit": "জমা দিয়ে শেষ করো",

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
  "talk.reply.greeting":
    "হাই। তুমি এসেছ, ভালো লাগল। এখন তোমার মনে কী চলছে?",
  "talk.reply.anxiety":
    "ওই ছটফটে, টানটান লাগাটা সহ্য করা কঠিন। একটু ধীরে করি — এখন কি পায়ের নিচে মাটিটা টের পাচ্ছ? কী থেকে শুরু হলো, যদি জানো, বলো।",
  "talk.reply.somatic":
    "শরীর অনেকটা বয়ে নেয় — চাপ বাড়লে বুকে চাপ বা ভারী লাগা খুব সাধারণ। কয়েকবার ধীরে করে শ্বাস ছাড়ো, নেওয়ার চেয়ে ছাড়াটা লম্বা করে। তুমি করতে করতে আমি আছি।",
  "talk.reply.lowMood":
    "যখন কিছুই ভালো লাগে না, ছোট জিনিসও ভারী হয়ে যায়। সব কিছু গুছিয়ে বলতে হবে এমন নয়। আজকের দিনটা কেমন গেল?",
  "talk.reply.sleep":
    "ঘুম এলোমেলো হলে সব কিছু কঠিন লাগে। ইদানীং রাতগুলো কেমন — ঘুম আসতে দেরি, নাকি মাঝরাতে ভেঙে যাওয়া?",
  "talk.reply.exam":
    "পরীক্ষার সময়টা যেন বাকি সব গিলে ফেলে। এর পরে কীসের সামনে দাঁড়াতে হবে?",
  "talk.reply.lonely":
    "এটা একা একা বয়ে বেড়ানোরও নিজের একটা ওজন আছে। আমি এখন আছি। সাধারণত কে তোমার আশেপাশে থাকে, একটুও হলেও?",
  "talk.reply.thanks":
    "যেকোনো সময়। আবার যখন কথা বলতে চাইবে, আমি আছি।",
  "talk.reply.default": "বলার জন্য ধন্যবাদ। এটা নিয়ে আরও একটু বলবে?",
  "talk.reply.default2": "আমি শুনছি। এর পিছনে কী আছে বলে তোমার মনে হয়?",

  // Today — daily check-in
  "today.checkin.heading": "আজ কেমন চলছে?",
  "today.checkin.sub": "মিনিটখানেকের ব্যাপার। কোনো উত্তরই ভুল নয়।",

  "today.mood.legend": "এই মুহূর্তে তোমার মন কেমন?",
  "today.mood.1": "খুব খারাপ",
  "today.mood.2": "খারাপ",
  "today.mood.3": "মাঝামাঝি কোথাও",
  "today.mood.4": "মোটামুটি ভালো",
  "today.mood.5": "বেশ ভালো",

  "today.sleep.legend": "কতটা ঘুম হয়েছে?",
  "today.sleep.value": "মোটামুটি {hours} ঘণ্টা",
  "today.sleep.zero": "এক ঘণ্টারও কম",

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

  "today.back.title": "আবার দেখা হয়ে ভালো লাগল।",
  "today.back.body": "পিছনের কিছু পুষিয়ে নেওয়ার দরকার নেই। চলো শুধু আজকেরটা করি।",

  "today.done.heading": "লিখে রাখা হলো।",
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
  "trends.sub": "সাপ্তাহিক, তোমার নিজের স্বাভাবিকের সঙ্গে — অন্য কারও সঙ্গে নয়।",
  "trends.series.mood": "মন",
  "trends.series.sleep": "ঘুম",
  "trends.series.energy": "শক্তি",
  "trends.series.social": "মেলামেশা",
  "trends.chartLabel": "{series}, সাপ্তাহিক, গত {weeks} সপ্তাহে",
  "trends.range": "তোমার সাধারণ পরিসর: {low}–{high}",
  "trends.thisWeek": "এই সপ্তাহে: {value}",
  "trends.insightLabel": "আমি যা খেয়াল করছি",
  "trends.insight":
    "গত কয়েক সপ্তাহে তোমার মন আর শক্তি নেমে গেছে, আর এখন তোমার সাধারণ পরিসরের একটু নিচে — মোটামুটি যখন থেকে তোমার ঘুম কমে গেছে।",
  "trends.patternsLabel": "যেসব প্যাটার্ন খেয়াল করেছি",
  "trends.pattern.1": "এই মাসে সপ্তাহের কাজের দিনগুলোয় বেশিরভাগ রাতে ঘুম ছয় ঘণ্টার কম।",
  "trends.pattern.2": "যেসব সপ্তাহে মেলামেশা কমে, সেই সপ্তাহগুলোয় মন সাধারণত নিচু থাকে।",
  "trends.pattern.3":
    "শক্তি তোমার ঘুমকে ঘনিষ্ঠভাবে অনুসরণ করেছে — একসঙ্গে ওঠে আর নামে।",
  "trends.stored.link": "আমার সম্পর্কে যা কিছু জমা আছে দেখো",
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
} satisfies Record<Keys, string>;
