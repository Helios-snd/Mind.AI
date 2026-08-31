/**
 * English key map. This is the source of truth for every user-facing string
 * in the onboarding flow and the Need Help Now sheet.
 *
 *   type Keys = keyof typeof en
 *
 * bn.ts must `satisfies Record<Keys, string>`, so a missing Bengali key is a
 * type error. Do not add strings in components — add a key here first.
 *
 * Placeholders are written as {name} / {current} / {total} and filled by t().
 */
export const en = {
  // Shared
  "action.back": "Back",
  "action.continue": "Continue",
  "action.close": "Close",
  "action.retry": "Try again",
  "state.loading": "One moment.",
  "state.empty": "Nothing here yet.",
  "state.error": "Something did not load. You can try again.",

  // Onboarding — Step 1: language
  "onboarding.language.heading": "First, which language feels easiest?",
  "onboarding.language.subline":
    "You can change this any time, and you can mix languages when you talk to me.",
  "onboarding.language.english": "English",
  "onboarding.language.bengali": "বাংলা",

  // Onboarding — Step 2: baseline
  "onboarding.baseline.heading":
    "A few questions, so I know what normal looks like for you.",
  "onboarding.baseline.subline":
    "This isn't a test. There are no wrong answers, and nobody else sees this.",
  "onboarding.baseline.counter": "{current} / {total}",
  "onboarding.baseline.answer.0": "Never",
  "onboarding.baseline.answer.1": "Sometimes",
  "onboarding.baseline.answer.2": "Often",
  "onboarding.baseline.answer.3": "Almost always",

  // Onboarding — Step 3: consent
  "onboarding.consent.heading": "Before we go further.",
  "onboarding.consent.line.stored":
    "What you write here is stored so I can notice patterns over time.",
  "onboarding.consent.line.readDelete":
    "You can read everything I've stored, and delete any of it, whenever you want.",
  "onboarding.consent.line.ai":
    "I'm an AI. I'll tell you honestly when something is beyond what I can help with.",
  "onboarding.consent.line.college":
    "Your college never reads your conversations.",
  "onboarding.consent.checkbox": "I've read this and I'm okay to continue.",
  "onboarding.consent.disclosure.summary": "What exactly is stored?",
  "onboarding.consent.disclosure.body":
    "Your language choice, your answers to the questions just now, the date you agree to this, and the plan and contact you write on the next screen. Nothing is shared outside this app.",

  // Onboarding — Step 4: crisis plan and trusted contact
  "onboarding.crisis.heading": "One last thing, and it matters.",
  "onboarding.crisis.subline":
    "Write this while things are calm. On a hard day I'll show it back to you in your own words.",
  "onboarding.crisis.q1.label": "Who would you want to talk to?",
  "onboarding.crisis.q1.placeholder": "Rhea. And didi if it's really bad.",
  "onboarding.crisis.q2.label": "What helps you?",
  "onboarding.crisis.q2.placeholder":
    "Walking by the lake. Cold water on my face. Getting out of the room.",
  "onboarding.crisis.q3.label": "What makes it worse?",
  "onboarding.crisis.q3.placeholder":
    "Being alone all evening. Scrolling. Skipping meals.",
  "onboarding.crisis.contact.heading":
    "And one person I can reach out to, if you ever go quiet when things are bad.",
  "onboarding.crisis.contact.name": "Name",
  "onboarding.crisis.contact.relationship": "Relationship",
  "onboarding.crisis.contact.phone": "Phone",
  "onboarding.crisis.contact.helper":
    "Your choice entirely — a friend, a sibling, a roommate, anyone. It doesn't have to be family.",
  "onboarding.crisis.error.required": "This one is needed before we finish.",
  "onboarding.crisis.error.phone":
    "A phone number with the digits, please. Spaces and a +91 are fine.",
  "onboarding.crisis.submit": "Save and finish",

  // Need help now — button
  "help.button": "Need help now",

  // Need help now — sheet
  "help.heading": "Need help now",

  "help.telemanas.title": "Call Tele-MANAS — 14416",
  "help.telemanas.subtitle": "Free, 24 hours, in Bengali or English.",

  "help.contact.title": "Message {name}",
  "help.contact.titleUnnamed": "Message the person you chose",
  "help.contact.subtitle": "The person you chose.",
  "help.contact.disabledSubtitle": "Add someone in your profile first.",
  "help.contact.messageLabel": "Your message",
  "help.contact.prefill":
    "I'm not doing okay right now and I didn't know who to tell. Can you call me?",
  "help.contact.send": "Send",
  "help.contact.copy": "Copy the message",
  "help.contact.copied": "Copied",

  "help.plan.title": "Show me my plan",
  "help.plan.subtitle": "What you wrote on a calmer day.",
  "help.plan.empty": "You haven't written a plan yet.",

  "help.stay.title": "Just stay with me",
  "help.stay.subtitle": "No calls. I'll be here.",

  // Authenticated stub screens
  "today.heading": "Today",
  "today.body": "You're set up. This is where each day will start.",
  "talk.heading": "Talk",
  "talk.body": "I'm here. Start whenever you want.",

  // Talk — conversation
  "talk.disclosure.body":
    "One thing first: I'm an AI, not a person. I'll be honest when something is beyond me, and a real person is always one tap away — that's the button on every screen.",
  "talk.disclosure.dismiss": "Got it",
  "talk.composer.placeholder": "Type what's on your mind",
  "talk.composer.send": "Send",
  "talk.composer.hint": "Enter to send · Shift + Enter for a new line",
  "talk.mic.start": "Record",
  "talk.mic.stop": "Stop",
  "talk.mic.cancel": "Cancel",
  "talk.mic.recording": "Listening… {time}",
  "talk.mic.done":
    "Recorded. Turning speech into text happens once the backend is connected — edit it here before you send.",
  "talk.mic.denied":
    "Microphone access is off. Turn it on in your browser settings, or just type.",
  "talk.typing": "typing…",
  "talk.failed": "Didn't send.",
  "talk.retry": "Try again",
  "talk.day.today": "Today",
  "talk.day.yesterday": "Yesterday",
  "talk.reply.greeting":
    "Hi. I'm glad you're here. What's going on for you right now?",
  "talk.reply.anxiety":
    "That restless, keyed-up feeling is hard to sit with. Let's slow it down a little — can you feel your feet on the floor right now? Tell me what set it off, if you know.",
  "talk.reply.somatic":
    "The body carries a lot of this — a tight chest or a heavy feeling is really common when things build up. Try breathing out slowly, longer than you breathe in, a few times. I'm here while you do.",
  "talk.reply.lowMood":
    "When nothing feels good, even small things get heavy. You don't have to talk it into making sense. What's today been like?",
  "talk.reply.sleep":
    "Sleep going sideways makes everything harder. What do the nights look like lately — trouble falling asleep, or waking up?",
  "talk.reply.exam":
    "Exam stretches have a way of swallowing everything else. What's the next thing you're up against?",
  "talk.reply.lonely":
    "Feeling alone with it is its own weight. I'm here now. Who's usually around for you, even a little?",
  "talk.reply.thanks":
    "Any time. I'm here whenever you want to pick this back up.",
  "talk.reply.default": "Thank you for telling me. Can you say a bit more about that?",
  "talk.reply.default2": "I'm listening. What's underneath that, if you had to guess?",

  // Today — daily check-in
  "today.checkin.heading": "How are things today?",
  "today.checkin.sub": "About a minute. There's no wrong answer.",

  "today.mood.legend": "Where's your mood right now?",
  "today.mood.1": "Really low",
  "today.mood.2": "Low",
  "today.mood.3": "Somewhere in the middle",
  "today.mood.4": "Pretty good",
  "today.mood.5": "Really good",

  "today.sleep.legend": "How much sleep did you get?",
  "today.sleep.value": "about {hours} hours",
  "today.sleep.zero": "less than an hour",

  "today.note.legend": "What's on your mind?",
  "today.note.placeholder": "Anything at all. A line is enough.",
  "today.note.mic.start": "Say it instead",
  "today.note.mic.stop": "Stop",
  "today.note.mic.cancel": "Cancel",
  "today.note.mic.recording": "Listening… {time}",
  "today.note.mic.done":
    "Recorded. Turning speech into text happens once the backend is connected — type or edit here for now.",
  "today.note.mic.denied":
    "Microphone access is off. You can turn it on in your browser settings, or just type.",

  "today.submit": "That's me for today",

  "today.back.title": "Good to see you back.",
  "today.back.body": "Nothing to catch up on. Let's just do today.",

  "today.done.heading": "Logged.",
  "today.done.addMore": "Add something more",

  "today.ack.exam":
    "Exams have a way of taking up all the room. Noticing that is fair.",
  "today.ack.lowSleep":
    "A short night makes the next day heavier. Worth being a bit gentle with yourself.",
  "today.ack.lowMood":
    "Sounds like a heavy day. Thank you for checking in anyway.",
  "today.ack.midMood": "An in-between kind of day. Those count too.",
  "today.ack.goodMood": "Good to hear today feels a little steadier.",
  "today.ack.noted": "Thanks for putting that into words — I've kept it.",

  "today.suggest.label": "One small thing, if you want it",
  "today.suggest.sleep.title": "A wind-down tonight",
  "today.suggest.sleep.body":
    "Pick a time to put the phone down, and keep the lights low for the half hour before bed.",
  "today.suggest.activation.title": "One small, doable thing",
  "today.suggest.activation.body":
    "Choose something that takes ten minutes — a walk, a shower, texting one person back — and do just that.",
  "today.suggest.grounding.title": "A slow minute",
  "today.suggest.grounding.body":
    "Name five things you can see, four you can hear, three you can feel. No rush.",
  "today.suggest.reframe.title": "Put it on paper",
  "today.suggest.reframe.body":
    "Write the worry as one sentence, then write what you'd say to a friend who told you the same thing.",

  // Trends — the mood meter
  "trends.heading": "Trends",
  "trends.sub": "Weekly, against your own normal — not anyone else's.",
  "trends.series.mood": "Mood",
  "trends.series.sleep": "Sleep",
  "trends.series.energy": "Energy",
  "trends.series.social": "Social",
  "trends.chartLabel": "{series}, weekly, over the last {weeks} weeks",
  "trends.range": "Your usual range: {low}–{high}",
  "trends.thisWeek": "this week: {value}",
  "trends.insightLabel": "What I notice",
  "trends.insight":
    "Your mood and energy slipped over the last few weeks and are sitting just below your usual range — around the same time your sleep got shorter.",
  "trends.patternsLabel": "Patterns I've noticed",
  "trends.pattern.1": "Sleep has been under six hours on most weeknights this month.",
  "trends.pattern.2": "Mood tends to be lower in the weeks when social contact drops.",
  "trends.pattern.3":
    "Energy has tracked your sleep closely — they rise and fall together.",
  "trends.stored.link": "See everything stored about me",
  "trends.empty.title": "Not enough yet.",
  "trends.empty.body": "Check in for about a week and this starts to fill in.",

  // Everything stored about you
  "data.heading": "Everything stored about you",
  "data.intro":
    "This is the full record. You can delete any of it, and it's gone for good.",
  "data.back": "Back",
  "data.notSet": "Not set",
  "data.delete": "Delete",
  "data.mood.1": "really low",
  "data.mood.2": "low",
  "data.mood.3": "okay",
  "data.mood.4": "good",
  "data.mood.5": "really good",
  "data.checkins.title": "Daily check-ins",
  "data.checkins.empty": "No check-ins yet.",
  "data.checkins.summary": "{mood} mood · {sleep} sleep",
  "data.checkins.note": " · note left",
  "data.convo.title": "Conversation",
  "data.convo.count": "{count} messages, starting {date}",
  "data.convo.empty": "No conversation yet.",
  "data.convo.delete": "Delete conversation",
  "data.setup.title": "Your setup",
  "data.setup.language": "Language",
  "data.setup.baseline": "Baseline answers",
  "data.setup.baselineValue": "{count} saved",
  "data.setup.consent": "Agreed to terms",
  "data.setup.plan": "Crisis plan",
  "data.setup.plan.saved": "Saved",
  "data.setup.plan.none": "Not written yet",
  "data.setup.contact": "Trusted contact",
  "data.setup.contact.none": "None chosen",
  "data.setup.editHint": "Edit these in your profile.",
};

export type Keys = keyof typeof en;
