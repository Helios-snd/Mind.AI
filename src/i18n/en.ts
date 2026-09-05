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
  "onboarding.crisis.contact.emergencyDisclosure":
    "One thing to know: this is the one exception to how Mind.AI usually works. If you're ever in immediate danger and don't respond within a few minutes, we may reach out to this person ourselves. That only happens in that one situation — never otherwise, and never without you seeing it happen first.",
  "onboarding.crisis.error.required": "This one is needed before we finish.",
  "onboarding.crisis.error.phone":
    "A phone number with the digits, please. Spaces and a +91 are fine.",
  "onboarding.crisis.submit": "Save and finish",

  // Onboarding — Step 5: keep your account
  "onboarding.progress.label": "Step {current} of {total}",
  "onboarding.claim.heading": "Want to keep this?",
  "onboarding.claim.subline":
    "Right now everything lives on this phone alone. Leave an email or a number and you can pick it back up on any device.",
  "onboarding.claim.label": "Email or phone",
  "onboarding.claim.placeholder": "you@college.edu, or 98765 43210",
  "onboarding.claim.send": "Send me a code",
  "onboarding.claim.codeLabel": "The code we sent",
  "onboarding.claim.codePlaceholder": "6 digits",
  "onboarding.claim.verify": "Confirm",
  "onboarding.claim.skip": "Not now",
  "onboarding.claim.skipNote":
    "You can add this later in your profile. Nothing is lost if you skip.",
  "onboarding.claim.sent": "Sent. Check your messages.",
  "onboarding.claim.error.destination":
    "An email address or a phone number, please.",
  "onboarding.claim.error.code": "That code is not right. Try again.",
  "onboarding.claim.error.taken":
    "That one is already linked to another account.",
  "onboarding.claim.devCode": "Development only — your code is {code}",

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

  // Help Now — calming mode (the destination for "Just stay with me")
  "help.calming.intro": "Let's slow things down for a moment.",
  "help.calming.inhale": "Breathe in — 4 seconds",
  "help.calming.hold": "Hold — 2 seconds",
  "help.calming.exhale": "Breathe out — 6 seconds",
  "help.calming.repeat": "Repeat a few times, for as long as it helps.",
  "help.calming.grounding": "Or, notice 3 things you can see around you.",
  "help.calming.back": "Back to Help Now",

  // Navigation
  "nav.label": "Main",
  "nav.today": "Today",
  "nav.talk": "Talk",
  "nav.trends": "Trends",
  "nav.me": "Me",

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

  // Today — daily check-in
  "today.checkin.heading": "How are things today?",
  "today.checkin.sub": "About a minute. There's no wrong answer.",

  "today.mood.legend": "Where's your mood right now?",
  "today.mood.1": "Really low",
  "today.mood.2": "Low",
  "today.mood.3": "Somewhere in the middle",
  "today.mood.4": "Pretty good",
  "today.mood.5": "Really good",

  "today.energy.legend": "How much energy did you have?",
  "today.energy.1": "Running on empty",
  "today.energy.2": "Low",
  "today.energy.3": "Enough to get by",
  "today.energy.4": "Fairly good",
  "today.energy.5": "Plenty",

  "today.social.legend": "Did you spend time around people?",
  "today.social.1": "Kept to myself",
  "today.social.2": "Barely",
  "today.social.3": "A little",
  "today.social.4": "A fair bit",
  "today.social.5": "Lots",

  "today.sleep.legend": "How much sleep did you get?",
  "today.sleep.value": "about {hours} hours",
  "today.sleep.zero": "less than an hour",

  "today.appetite.legend": "How has your appetite been?",
  "today.appetite.1": "Barely ate",
  "today.appetite.2": "Less than usual",
  "today.appetite.3": "About normal",
  "today.appetite.4": "Good",
  "today.appetite.5": "Very good",

  "today.activity.legend": "Did you get out at all?",
  "today.activity.1": "Stayed in my room",
  "today.activity.2": "Hardly",
  "today.activity.3": "A bit",
  "today.activity.4": "A decent amount",
  "today.activity.5": "Out and about",

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
  "today.submit.saving": "Saving\u2026",
  "today.submit.failed": "That didn't save. Check your connection and try again.",

  "today.back.title": "Good to see you back.",
  "today.back.body": "Nothing to catch up on. Let's just do today.",

  "today.done.heading": "Logged.",
  "today.handoff.body": "Taking you to your patterns\u2026",
  "today.done.seeTrends": "See your patterns",
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
  "trends.sub": "Against your own normal \u2014 not anyone else's.",

  // Range selector
  "trends.range.7d": "7 days",
  "trends.range.4w": "4 weeks",
  "trends.range.6w": "6 weeks",
  "trends.rangeLabel": "How far back to look",

  // Per-series card
  "trends.average": "Average",
  "trends.stat.average": "Average",
  "trends.stat.highest": "Highest",
  "trends.stat.lowest": "Lowest",
  "trends.stat.change": "Change",
  "trends.stat.changeFlat": "No change",
  "trends.stat.dash": "\u2014",
  "trends.usual": "Your usual",
  "trends.usualRange": "{low}\u2013{high}",
  "trends.latest": "Latest",
  "trends.noBaselineYet":
    "Keep checking in and your usual range will appear here.",
  "trends.single.early": "Just getting started \u2014 one check-in so far.",
  "trends.single.reference": "Your starting point was {value}.",
  "trends.notEnoughSeries": "Not enough check-ins yet for this one.",

  // Observations \u2014 what the numbers did. Never a label, never a diagnosis.
  "trends.obs.belowBaseline":
    "Your {series} has been lower than your usual range recently.",
  "trends.obs.aboveBaseline":
    "Your {series} has been higher than your usual range recently.",
  "trends.obs.withinBaseline": "Your {series} has been within your usual range.",
  "trends.obs.declining": "Your {series} has drifted down over this period.",
  "trends.obs.rising": "Your {series} has been picking up over this period.",
  "trends.obs.steady": "Your {series} has been fairly steady.",

  // Gentle, non-clinical starting points. Offered only when something moved.
  "trends.tip.mood":
    "One small, doable thing today often lifts a low stretch more than waiting for the mood to change first.",
  "trends.tip.sleep":
    "A little more consistent sleep may help you feel more rested.",
  "trends.tip.sleepConsistency":
    "Try keeping your sleep and wake time roughly consistent for a few days.",
  "trends.tip.energy":
    "Low energy often follows short nights. Going easy on yourself for a few days is a reasonable response.",
  "trends.tip.social":
    "Consider reaching out to someone you feel comfortable with.",
  "trends.tipLabel": "A gentle place to start",

  // At a glance
  "trends.glance.heading": "At a glance",
  "trends.glance.noticing": "What you're noticing",
  "trends.change.up": "up {value}",
  "trends.change.down": "down {value}",
  "trends.change.none": "about the same",
  "trends.change.new": "\u2014",

  // Cross-series summaries
  "trends.summary.sleepAndMood":
    "Your sleep and mood have both dipped over the last few check-ins.",
  "trends.summary.socialAndMood":
    "Your mood has been lower over the same stretch that social contact dropped.",
  "trends.summary.sleep": "Your sleep has been shorter than usual lately.",
  "trends.summary.mood": "Your mood has been lower than your usual range lately.",
  "trends.summary.steady":
    "Nothing much has shifted lately \u2014 things look fairly steady.",
  "trends.series.mood": "Mood",
  "trends.series.sleep": "Sleep",
  "trends.series.energy": "Energy",
  "trends.series.social": "Social",
  "trends.dash.heading": "Your recent patterns",
  "trends.dash.sub": "A look at how your days have been moving, based on what you've shared.",
  "trends.metric.of5": "{value} / 5",
  "trends.metric.hrs": "{value} hrs",
  "trends.dir.rising": "improving",
  "trends.dir.declining": "lower",
  "trends.dir.steady": "steady",
  "trends.dir.unknown": "not enough yet",

  "trends.compare.heading": "Your {series} lately",
  "trends.compare.recent": "Recent average",
  "trends.compare.baseline": "Your usual",
  "trends.compare.above": "{value} above your usual",
  "trends.compare.below": "{value} below your usual",
  "trends.compare.around": "Around your usual",

  "trends.snapshot.heading": "Your check-in snapshot",
  "trends.snapshot.sub": "A quick look at what you've been logging lately.",

  "trends.snapshot.checkins.label": "Check-ins",
  "trends.snapshot.checkins.value": "{logged} / {total}",
  "trends.snapshot.checkins.caption": "You've checked in on {logged} of the last {total} days.",

  "trends.snapshot.gettingOut.label": "Getting out",
  "trends.snapshot.gettingOut.value": "{positive} / {total}",
  "trends.snapshot.gettingOut.caption": "You've logged getting out on {positive} of your last {total} check-in days.",
  "trends.snapshot.gettingOut.noneCaption": "Log activity in Today and this will start to fill in.",

  "trends.snapshot.appetite.label": "Appetite",
  "trends.snapshot.appetite.none": "Not enough logged yet",
  "trends.snapshot.appetite.caption": "Your recent appetite log.",
  "trends.snapshot.appetite.noneCaption": "A few more check-ins will show a pattern here.",
  "trends.secondary.direction.rising": "Picking up",
  "trends.secondary.direction.declining": "Lower than earlier",
  "trends.secondary.direction.steady": "Mostly steady",
  "trends.secondary.activity.count": "You got out on {positive} of {total} days",
  "trends.secondary.none": "Not logged yet",

  "trends.start.heading": "Your starting point",
  "trends.start.sub": "Where things were when you began, on {date}.",
  "trends.start.baselineTaken": "You completed your first set of questions.",
  "trends.start.noValues": "Your earliest check-ins will show here as a reference point.",
  "trends.start.then": "Then",
  "trends.start.now": "Now",

  "trends.notes.heading": "A few things you've logged",
  "trends.notes.tooEarly": "You need a few more check-ins before a useful pattern appears.",
  "trends.action.heading": "One small thing to try",

  "trends.state.thin": "A few more check-ins will help reveal a pattern.",
  "trends.empty.cta": "Go to Today",
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

  // Everything stored about you -- F2 additions. Screenings/Safety copy
  // deliberately reuses me.wellbeing.* verbatim -- same GET /me/summary,
  // same words, no second translation to drift out of sync.
  "data.signals.title": "Observations",
  "data.signals.summary":
    "{count} observations recorded from your check-ins and messages.",
  "data.signals.empty": "No observations recorded yet.",
  "data.screenings.title": "Screenings",
  "data.safety.title": "Safety checks",
  "data.consent.title": "Consent history",
  "data.consent.empty": "No consent recorded yet.",
  "data.consent.item": "{kind} — {date}",
  "data.consent.kind.onboarding": "Agreed to terms",
  "data.escalations.title": "Support offers",
  "data.escalations.empty": "No support offers yet.",
  "data.escalations.status.approved": "Shared with a counsellor",
  "data.escalations.status.declined": "Declined",
  "data.escalations.status.expired": "Expired",
  "data.export.title": "Export your data",
  "data.export.body":
    "Download a full copy of everything stored about you, as a single file.",
  "data.export.button": "Export my data",
  "data.export.working": "Preparing…",
  "data.export.error": "Something went wrong. Try again.",

  // Me — profile and controls
  "me.heading": "Me",
  "me.sub": "Your settings, your words, your data.",

  // Me — account status (F1)
  "me.account.title": "Account",
  "me.account.anonymous": "Anonymous account",
  "me.account.anonymousBody":
    "This account isn't connected to an email or phone yet.",
  "me.account.connected": "Account connected",
  "me.account.connectedBody": "{contact}",

  // Me — your patterns (reuses Trends' own numbers, never a second calculation)
  "me.patterns.title": "Your patterns",
  "me.patterns.empty": "Check in on Today to start seeing patterns here.",
  "me.patterns.checkins": "{count} check-ins",
  "me.patterns.seeTrends": "See full Trends",

  // Me — talk
  "me.talk.title": "Talk",
  "me.talk.empty": "No conversation yet.",
  "me.talk.messages": "{count} messages",
  "me.talk.open": "Open Talk",

  // Me — wellbeing checks (safety + screenings, plain language only —
  // never a tier number, never "3a"/"3b", never a severity band)
  "me.wellbeing.title": "Wellbeing checks",
  "me.wellbeing.safety.default":
    "Our safety check runs quietly on every message you send.",
  "me.wellbeing.safety.flagged":
    "{count} recent messages were checked more closely by our safety check.",
  "me.wellbeing.safety.pendingReview":
    "A counsellor may follow up with you soon.",
  "me.wellbeing.screenings.empty": "No screenings completed yet.",
  "me.wellbeing.screenings.item": "{instrument} — completed {date}",
  "me.wellbeing.screenings.phq9": "PHQ-9",
  "me.wellbeing.screenings.gad7": "GAD-7",
  "me.wellbeing.screenings.asrsV11": "ASRS",
  "me.wellbeing.screenings.dass21": "Your starting check-in",

  "me.language.title": "Language",
  "me.language.hindiSoon": "soon",
  "me.plan.title": "Your crisis plan",
  "me.plan.none": "You haven't written one yet.",
  "me.plan.edit": "Edit",
  "me.plan.save": "Save",
  "me.plan.cancel": "Cancel",
  "me.plan.saved": "Saved",
  "me.contact.title": "Trusted contact",
  "me.contact.none": "No one chosen yet.",
  "me.contact.relationshipLine": "{relationship} · {phone}",
  "me.human.title": "A real person, any time",
  "me.human.row": "Talk to a real person",
  "me.human.always":
    "The “Need help now” button is on every screen — it never goes away.",
  "me.data.title": "Your data",
  "me.data.see": "See everything stored about me",
  "me.data.retention":
    "What you write is kept so patterns can show over time. Nothing is shared outside this app, and your college never reads it.",
  "me.data.delete": "Delete everything and start over",
  "me.delete.heading": "Delete everything?",
  "me.delete.body":
    "This removes your check-ins, your conversation, your plan, your contact and your answers from this device. It cannot be undone.",
  "me.delete.confirmLabel": "Type DELETE to confirm",
  "me.delete.confirmWord": "DELETE",
  "me.delete.button": "Delete everything",
  "me.delete.cancel": "Keep my data",
  "me.delete.done": "Done. Everything has been cleared.",
  "human.heading": "Talk to a real person",
  "human.back": "Back",
  "human.body": "You can reach a trained counsellor without going through the app.",
  "human.telemanas.title": "Tele-MANAS — 14416",
  "human.telemanas.body":
    "Free, 24 hours, in Bengali or English. One call, no referral needed.",
  "human.counsellor.title": "Your campus counsellor",
  "human.request.intro":
    "Every campus has one. Ask, and we'll show you exactly what a short summary would include before anything is shared — only what you approve, and only when you're ready.",
  "human.request.button": "Ask a counsellor to check in with me",
  "human.recent.title": "Recent activity",

  // Escalation — the tier-2 interstitial (E1) and a student's own request (F3)
  "escalation.reason.trend_decline_mood":
    "Your mood has been lower than your usual range for a little while. A counsellor might be able to help with that.",
  "escalation.reason.manual_request":
    "You asked for a counsellor to check in with you.",
  "escalation.share.heading": "What we'd share",
  "escalation.share.checkins": "Your recent check-in pattern",
  "escalation.share.talkMessages": "Your recent Talk messages",
  "escalation.share.reason": "The reason we're suggesting support",
  "escalation.share.request": "Why you asked for support",
  "escalation.share.nothingElse": "Nothing else from your account will be shared.",
  "escalation.approve": "Yes, share it",
  "escalation.notNow": "Not now",

  // Crisis screen — tier 3
  "crisis.heading": "Let's get you support right now",
  "crisis.humanReview":
    "A counsellor will check in with you by the next working day. You don't need to do anything else.",
  "crisis.back": "Back to Talk",
  "crisis.countdown.label":
    "If we don't hear from you, we'll reach out to your trusted contact. Tap anywhere, or Cancel, to let us know you're okay.",
  "crisis.countdown.cancel": "I'm okay — Cancel",
};

export type Keys = keyof typeof en;
