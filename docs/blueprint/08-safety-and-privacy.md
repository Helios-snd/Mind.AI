# 08 · Safety, escalation and privacy

---

## 1 · The three tiers

Every interaction resolves to **exactly one** of these. The tier is decided by Trend, **except when Safety overrides it, which it can do at any moment.**

### Tier 1 — We handle it

Ordinary bad days, exam stress, a fight with a friend, a rough week still inside this student's normal range. Care responds with an exercise or just a conversation. No human involved, nothing recorded as a concern.

> **Roughly 85% of all interactions should land here, and that is a success condition, not a failure.** A system that escalates constantly is useless to a counsellor.

### Tier 2 — You should talk to someone

A sustained decline, a screening score crossing threshold, or a pattern that has not responded to two weeks of self-help. The app says so plainly, explains **what it noticed and why**, and offers a real appointment.

The student appears on the counsellor's morning queue with a one-page brief. **Nothing is sent without the student seeing it first.** If they decline they stay in tier 2 and are asked again in a few days — **declining is not a dead end.**

### Tier 3 — Right now

Self-harm intent, a plan, means, or acute crisis. **Fired by the Safety agent alone.** The conversation changes immediately: no exercises, no cheerfulness, no attempt to handle it in-app.

- The student's own crisis plan is read back to them, in their own words.
- **Tele-MANAS 14416** is offered as a live call, not a phone number in small text.
- The campus emergency contact is alerted per a protocol agreed with the institution **in advance**.
- **A human reviews every tier-3 event, without exception** — including the ones that turned out to be nothing.

`FEATURES.md` splits this further: **3A** is flagged for the next working day with nothing automatic; **3B** is a **cancellable five-minute countdown** where the cancel affordance is as prominent as the countdown, and **only silence** triggers the contact. A gentle check-in follows the next morning.

### Design for false positives

> A tier-3 that turns out to be nothing costs a student five awkward minutes. A tier-3 that was missed costs something you cannot undo.

Say this out loud when someone asks about accuracy. It is the answer that marks you as serious.

---

## 2 · Current state — read this before demoing

**None of the above exists.** `docs/frontend-todo.md` marks Escalation & Screening UI as ❌ not started. There is no risk detection on any input path; `"hopeless"` and `"pointless"` in Talk match the low-mood regex and receive a generic supportive reply.

The hard constraints below currently hold largely **because the enforcing systems don't exist yet**. Two are genuinely implemented: the AI disclosure shown once (`talk/Disclosure.tsx`) and the always-visible route to a human (`HelpNowButton`, fixed on every screen).

---

## 3 · The eleven hard constraints

Constraints, not features. A demo deadline does not erode them.

| # | Constraint | Enforced where |
|---|---|---|
| 1 | **Never diagnoses.** Says what it observed and what a professional might help with | Companion + Screening system prompts; output filter |
| 2 | **Never advises on medication** — dosage, starting, stopping, interactions. Routes every such question to a human | Companion prompt + a hard output filter, not prompt alone |
| 3 | **Discloses it is an AI** clearly at the start, and again if a student seems to have forgotten. **Not on every message** | `talk/Disclosure.tsx`, dismissed once via `aimind.talk.disclosureSeen.v1` |
| 4 | **Does not attempt to talk someone out of a crisis.** At tier 3 it stops being clever and starts connecting | Tier-3 branch replaces the Companion response entirely |
| 5 | **Crisis detection runs independently** of the conversational model and cannot be suppressed by it | Separate parallel call — see `07-agents.md §5` |
| 6 | **Every tier-3 event gets human review**, including the nothings | `escalation_events.reviewed_by` is not nullable at close |
| 7 | **No emotion inference from voice or face.** Transcription yes; affect from acoustics, no | STT returns text only. The science is contested and the claim will not survive scrutiny |
| 8 | **Always a visible route to a human**, on every screen, whatever tier | `HelpNowButton`, `fixed right-4 z-40`, both layouts |
| 9 | **The trusted contact is never defaulted to a parent** | Free-text `relationship`; helper copy says *"a friend, a sibling, a roommate, anyone. It doesn't have to be family."* |
| 10 | **The college never reads an individual conversation.** Administration sees only anonymised, thresholded aggregates | The privacy wall, below |
| 11 | **No streaks, badges, points, or penalty animations** | A missed day triggers a gentle return banner, never a broken chain |

---

## 4 · The privacy wall

This is the single decision that makes or breaks the campus product, and it is worth more thought than any feature.

> If students believe the college can read their conversations, they will not use it. Not cautiously, not less — **not at all.** Word travels across a hostel in a day.

So the wall has to be architectural, explainable in one sentence, and true:

> **The counsellor sees a brief only after the student agrees to be referred. The college administration never sees an individual, ever — only anonymised, thresholded aggregates.**

Everything else follows:

- Encryption at rest and in transit.
- **Data minimisation** — keep the structured signals, not indefinite raw transcripts.
- Student-initiated deletion that **actually deletes**.
- Retention limits agreed with the institution **in writing**, enforced by a scheduled purge.
- **DPDP Act 2023** compliance handled properly rather than as a checkbox, since mental-health data is about as sensitive as personal data gets.

### Enforced in the schema, not in review

- `student_briefs.released_to_counsellor_at` stays null until `approved_by_student_at` is set.
- `institution_aggregates.cohort_size` exists so a row below the agreed k-anonymity threshold is **never returned**.
- `access_logs` records every counsellor read of a student record.
- `consent_events` is append-only and excluded from the ordinary delete cascade, so the audit trail cannot be destroyed by a routine deletion.

### The one exception, named honestly and up front

An **imminent risk to life** triggers the tier-3 protocol, which may involve contacting the emergency contact agreed with the institution.

> Students accept this when they are told at the start. They do not forgive discovering it later.

It belongs in onboarding consent copy, in plain language, before anything is collected.

---

## 5 · What the student is currently promised

Verbatim from `StepConsent.tsx`, so the backend does not quietly contradict it:

- "What you write here is stored so I can notice patterns over time."
- "You can read everything I've stored, and delete any of it, whenever you want."
- "I'm an AI. I'll tell you honestly when something is beyond what I can help with."
- **"Your college never reads your conversations."** (bolded in the UI)

And the `<details>` disclosure: *"Your language choice, your answers to the questions just now, the date you agree to this, and the plan and contact you write on the next screen. Nothing is shared outside this app."*

From `me/page.tsx`: *"What you write is kept so patterns can show over time. Nothing is shared outside this app, and your college never reads it."*

**Two gaps to close in the consent copy before real students see it:**

1. The tier-3 emergency-contact exception is **not currently disclosed anywhere in onboarding**. Constraint: it must be, before that protocol ships.
2. The `<details>` list does not mention that conversations and check-ins are stored — it only names onboarding data. Once Talk and Today are server-backed, that list is incomplete and must be updated.

---

## 6 · Logging rules

The backend logs structured events. It **never** writes to logs:

- check-in note text
- conversation message text
- crisis-plan field contents
- trusted-contact name or phone
- screening item answers

Log the fact, the user id, the timestamp and the verdict. Not the content. A log aggregator is not controlled infrastructure in the sense `FEATURES.md` means.

---

## 7 · Regulatory context

From `FEATURES.md`, for the record:

- **Sukdeb Saha v. State of Andhra Pradesh** (25 Jul 2025) — binding guidelines.
- **UGC guidelines, Jan 2026** — Mental Health Centre, 24×7 Tele-MANAS-integrated helpline, MANAS-SETU reporting. The aggregate view doubles as the compliance artefact.
- **DPDP Act 2023.**
- Context: ~84.5% treatment gap, ~0.75 psychiatrists per 100,000.

---

## 8 · Open questions worth asking a clinician

Not hidden. Walking up to a psychiatry researcher with a genuinely hard question is a better opening than a pitch.

1. **Where should the tier-2 threshold actually sit?** Too sensitive floods the counsellor; too conservative misses people. This is a clinical judgement, not an engineering one.
2. **Do standard instruments hold up in translation?** PHQ-9 in Bengali is not PHQ-9 in English. Validated translations exist for some instruments and not others, and somatic idioms of distress complicate scoring.
3. **What does the escalation protocol look like inside a real college?** Who gets alerted at 2am, and by what agreement? No two institutions answer this the same way, and it must be settled before a pilot, not during one.
4. **What is the false-negative rate, and how would we ever know?** You cannot measure the crisis you missed. This is a genuinely open evaluation problem and a good reason to have an academic partner.
