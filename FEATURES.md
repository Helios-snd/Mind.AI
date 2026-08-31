PRODUCT: AIMind — AI mental health companion for college students, plus a counsellor triage console.
POSITIONING: The layer between "I'm not doing well" and "I need to see a psychiatrist." Institution pays, student never does.
PLATFORM: Web app (responsive). Student app designed mobile-first at 390px; counsellor console desktop at 1280px.
LANGUAGES: Bilingual English + Bengali from the ground up (not translated-after). More Indic languages planned as a research track.
INPUT MODES: Multimodal — text and voice. Voice is transcription only.

=== ARCHITECTURE: 7 AGENTS ===
1. COMPANION — holds the conversation, warm, remembers history. Never diagnoses.
2. SIGNAL — extracts structured observable facts from free text: sleep, appetite, energy, social contact, somatic complaints, self-worth language.
3. TREND — longitudinal memory. Owns baseline per user. Detects slope, not state. Source of the weekly insight sentence.
4. SCREENING — administers validated instruments conversationally (PHQ-9, GAD-7, ISI, DASS-21). Decides WHEN to screen based on drift.
5. CARE — delivers guided self-help: behavioural activation, sleep scheduling, worry postponement, grounding, cognitive reframing.
6. SAFETY — reads EVERY message independently and in parallel. Cannot be overridden by any other agent. Fires escalation on its own authority.
7. REFERRAL — owns the handoff: matching, booking, clinical brief generation, and post-referral follow-up.

=== STUDENT APP ===
ONBOARDING (4 steps)
- Language selection (English / বাংলা / हिन्दी)
- One-time baseline screening (DASS-21), framed as "so I know what normal looks like for you"
- Plain-language consent: what's stored, how long, who sees it. Explicit promise the college never reads conversations.
- Crisis plan written while calm: who I'd call, what helps me, what makes it worse
- Student names ONE trusted contact — their choice, never defaulted to parent/guardian

TAB 1 — TODAY (daily check-in, 60 seconds)
- Five-face mood scale (no numbers)
- Sleep hours slider
- One free-text box: "what's on your mind?" with mic option
- Scripted acknowledgement that reflects back something specific
- At most one suggested action; rest of screen deliberately empty
- Missed day = "good to see you back." No streaks, no penalty state.

TAB 2 — TALK (open conversation, any hour)
- Messaging UI, remembers previous conversations
- Understands somatic/vernacular distress (ghabrahat, bechaini, chest heaviness, "kichu bhalo lagche na")
- Voice input: record → transcribe → editable before send
- AI disclosure shown once, early, not repeated on every message

TAB 3 — TRENDS (the mood meter)
- Weekly, not daily
- Four series: mood, sleep, energy, social contact
- Plotted against the user's OWN baseline band — never a population average
- One plain-language insight sentence beneath the chart (this is the point, not the chart)
- Short list of noticed patterns, phrased as observations not judgements
- "See everything stored about me" — full record in plain language, per-item delete

TAB 4 — ME
- Language toggle, crisis plan (editable), trusted contact, data controls
- Permanently visible "talk to a real person" route

PERSISTENT — "NEED HELP NOW" BUTTON (every screen, calm not alarming)
Opens a 4-door sheet, no menus, no scrolling:
1. Call Tele-MANAS 14416 (one tap, dials)
2. Message [chosen contact] — pre-written editable text so the user doesn't have to find words
3. Show me my plan — their own words from a calmer day
4. Just stay with me — app talks, routes nowhere, calls no one

CARE MODULES
- Behavioural activation (one small specific action per day)
- Sleep scheduling and wind-down
- Worry postponement, grounding for acute anxiety
- Guided cognitive reframing, conversational not worksheet
- Exam-period mode: shorter sessions, auto-active during exam calendar
- Called "guided self-help," never "AI therapy"

SCREENING
- PHQ-9, GAD-7, ISI, DASS-21 delivered conversationally, one item at a time
- Triggered by drift, not on a fixed weekly schedule
- PHQ-9 item 9 (self-harm) routes through SAFETY before the questionnaire continues
- Student sees plain language; counsellor sees the score

=== ESCALATION: 3 TIERS ===
TIER 1 — handled in-app. Ordinary bad days. ~85% of interactions should land here.
TIER 2 — "you should talk to someone." Sustained decline or threshold crossed.
  - App explains what it noticed and why
  - Offers real appointment slots
  - Student PREVIEWS AND APPROVES exactly what is shared before anything is sent
  - Declining keeps the door open; re-offered in a few days
TIER 3A — risk thoughts, no plan/means/intent. Crisis plan surfaced, options offered, NOTHING automatic. Counsellor flagged next working day.
TIER 3B — imminent risk (stated intent, plan, or means).
  - Visible cancellable countdown: "If I don't hear from you in 5 minutes, I'll let [name] know you need someone tonight. You can stop this any time."
  - Cancel button as prominent as the countdown. Any interaction cancels.
  - Only silence triggers contact.
POST-EVENT — gentle next-morning check-in after any tier 3. Human review of every tier-3 event.

=== COUNSELLOR CONSOLE ===
MORNING QUEUE — ranked by CHANGE, not absolute severity. ~12 rows. Name, what moved, days, sparkline.
STUDENT BRIEF — one page, 60-second read: what changed and when, screening scores with dates, 6-week trend, 2–3 dated quotes in the student's own words, self-help tried and whether it worked, tier-3 history, note field. Header states it is a summary, not a diagnosis.
CASELOAD — ongoing students, appointments, and who's drifting again after being seen.
AGGREGATE (for administration) — anonymised and thresholded only. Engagement counts, distress across semester, exam-week spikes, referrals made vs accepted, median days from flag to appointment. No path to an individual. Doubles as the UGC MANAS-SETU compliance reporting artefact.

=== HARD CONSTRAINTS (never violate) ===
- Never diagnose. Never name a condition to the user.
- Never advise on medication (dosage, starting, stopping). Route to a human.
- Disclose it is an AI, clearly, once, early.
- SAFETY runs independently of conversation logic and cannot be overridden by it.
- Escalation is opt-in except tier 3b, which is warned and cancellable.
- Trusted contact chosen by the student, never defaulted to family.
- College sees aggregate only. Counsellor sees a brief only after student approval.
- No emotion inference from voice or face. Transcription only.
- No streaks, gamification, or penalties for a missed day.
- Always a visible route to a human on every screen.

=== EXPLICITLY NOT BUILDING ===
Community forum / peer chat · meditation or audio content library · streaks, badges, points · social feed or peer comparison · emotion detection from voice or face · real authentication · consumer subscriptions (institution pays)

=== REGULATORY CONTEXT (India) ===
- Supreme Court, Sukdeb Saha v. State of Andhra Pradesh (25 July 2025): binding student mental health guidelines, force of law. Institutions with 100+ students must employ a trained counsellor/psychologist.
- UGC mental health guidelines (January 2026): mandatory Mental Health & Well-being Centre, 24×7 helpline integrated with Tele-MANAS, monitoring committee, compliance tracked via MANAS-SETU portal with annual outcome reporting.
- Context: ~84.5% treatment gap (National Mental Health Survey); ~0.75 psychiatrists per 100,000 people. The mandate cannot be met by hiring alone.
- Compliance: DPDP Act 2023. Target architecture is self-hosted open-weight multilingual models, not third-party APIs, because mental health data should not leave controlled infrastructure.
