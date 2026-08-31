# Frontend TODO — per screen

Scope of this doc: **UI only.** Build every screen against the in-memory mock
(`src/api/mockClient.ts` pattern) with hard-coded fixtures and local state. No
real endpoints, no auth, no agent calls. Each section ends with a
**Backend later** note listing what gets swapped in.

---

## Progress snapshot (audited 2026-08-31)

| Area | State |
|---|---|
| Conventions / infra (i18n, tokens, reduced-motion, async states) | ✅ mostly in place |
| App shell & tab bar | ❌ not started — `Shell.tsx` has no navigation |
| Tab 1 — Today | ✅ built (frontend, localStorage + fixture reflection) |
| Tab 2 — Talk | ✅ built (frontend, localStorage thread + fixture replies) |
| Tab 3 — Trends | ❌ route does not exist |
| Tab 4 — Me | ❌ route does not exist |
| Need Help Now sheet | 🟡 ~80% — 4 doors, focus trap, compose, plan all built; small gaps |
| Onboarding | 🟡 ~75% — all 4 steps built & refresh-resilient; missing Hindi, progress indicator, 18 DASS items |
| Escalation & Screening UI | ❌ not started |
| Counsellor console | ❌ not started |

Legend: `[x]` done · `[~]` partial (see note) · `[ ]` not started.

---

## Conventions (apply to every screen)

- [x] Client components, App Router, route group `src/app/(app)/` exists.
- [x] i18n plumbing: `useT()` / `useI18n()` / `en.ts` + `bn.ts` with
      `satisfies Record<Keys,string>` enforcing parity.
- [x] `n()` locale-aware number formatter (Bengali digits under `bn`).
- [x] Tokens + `btn-primary` / `btn-outline` / `container-x` in `globals.css`
      and `tailwind.config.ts` (`brand`, `cream`, display/body fonts).
- [x] `usePrefersReducedMotion()` hook exists (`src/lib/`), used by StepBaseline.
- [~] Shared async states — `OnboardingLoading` / `OnboardingError` /
      `OnboardingEmpty` exist but are named onboarding-specific. **TODO:** promote
      to generic `AsyncState` components before reuse in the tabs.
- [ ] Mobile-first 390px verified per screen (nothing to verify yet).
- [ ] "No streaks / badges / penalty copy" — holds today; keep enforcing.

---

## Shared — app shell & tab bar   ❌

`src/components/Shell.tsx` renders only `{children}` + the help launcher. There
is no navigation anywhere.

- [ ] Bottom tab bar `src/app/(app)/_components/TabBar.tsx` — Today / Talk /
      Trends / Me. Fixed bottom, above the help launcher, safe-area padding.
- [ ] Active state from `usePathname()`, icons + labels, 44px targets.
- [ ] `role="navigation"`, `aria-current="page"` on the active tab.
- [ ] Hide the tab bar on `/onboarding`; show once `completedAt` is set.
- [ ] `(app)/layout.tsx` renders `<TabBar/>` for the 4 tabs, not onboarding.
- [ ] i18n keys `nav.today` / `nav.talk` / `nav.trends` / `nav.me`.

**Backend later:** none.

---

## Tab 1 — TODAY (daily check-in)   ✅ (frontend)

Route: `src/app/(app)/today/` — `page.tsx` orchestrator + `CheckInForm`,
`MoodScale`, `SleepSlider`, `NoteField`, `Acknowledgement`, `storage.ts`,
`reflect.ts`.

- [x] Mood scale: five SVG faces, no numbers, `radiogroup` with arrow-key nav.
- [x] Sleep slider: 0–12h / 0.5 steps, `aria-valuetext` readout ("about 6½
      hours"), Bengali digits via `n()`.
- [x] Free-text box + mic button, auto-grow textarea.
- [x] Submit → acknowledgement view (`role="status"`).
- [x] Acknowledgement reflects a signal (exam mention / short night / low mood)
      via `reflect.ts` fixture — marked `TODO(backend): COMPANION`.
- [x] One suggested-action card max; screen otherwise empty.
- [x] "Already checked in today" done state, with "add something more" to reopen.
- [x] "Good to see you back" banner when the last entry is ≥ 2 days old — no count.
- [x] Persist to `localStorage` (`aimind.today.v1`), SSR-safe, corrupt-data safe.
- [x] Soft guard: redirects to `/onboarding` if `completedAt` is unset.
- [ ] Re-check when the tab bar lands: guard + "returning" logic should move to
      the shell so it's consistent across tabs.

**Backend later:** POST check-in → SIGNAL/COMPANION; server returns ack + action;
SAFETY reads the note in parallel and may swap in an escalation view.

Voice input (shared with TALK)   🟡
- [x] `useVoiceCapture()` hook (`src/lib/`) — `MediaRecorder` start/stop/cancel,
      permission prompt, running timer, resolves the `Blob`.
- [x] Recording panel (timer + Stop + Cancel); on stop the field opens for
      typing with a hint. No waveform, no emotion viz, no face capture.
- [ ] Wire the `Blob` to a self-hosted STT call and prefill the transcript
      (single seam marked `TODO(backend)` in `NoteField.tsx`).

---

## Tab 2 — TALK (open conversation)   ✅ (frontend)

Route: `src/app/(app)/talk/` — `page.tsx` orchestrator + `MessageList`,
`Composer`, `Disclosure`, `storage.ts`, `replies.ts`.

- [x] Message list: user/assistant bubbles, day dividers (Today / Yesterday /
      date via `Intl`), auto-scroll (reduced-motion aware), animated typing dots
      that fall back to "typing…" text under reduced motion.
- [x] Composer: auto-grow textarea + send + mic, Enter to send / Shift+Enter
      newline, send disabled when empty.
- [x] One-time AI disclosure card (`aimind.talk.disclosureSeen.v1`), dismiss
      once, never per-message.
- [x] Local thread history (`aimind.talk.thread.v1`), rendered on mount;
      mid-send message caught by a refresh becomes `failed`.
- [x] Fixture reply engine `replies.ts` — matches vernacular/somatic cues in
      either language (*ghabrahat*, *bechaini*, "kichu bhalo lagche na", chest
      heaviness, …) → non-diagnostic reply keys. Marked `TODO(backend): COMPANION`.
- [x] Empty state (reuses `talk.body`).
- [x] Per-message failed + tap-to-retry (`window.__talkFail = true` forces the
      next send to fail, for reviewing that state).
- [x] `aria-live="polite"` on the latest assistant bubble.
- [x] Composer clears the global "Need help now" FAB with bottom padding.
- [ ] Shares the mic recording UI with Today by copy — extract if a third caller
      appears.

**Backend later:** stream from COMPANION with history; SAFETY per inbound message;
SCREENING can take over the thread one item at a time.

---

## Tab 3 — TRENDS (the mood meter)   ❌

Route: `src/app/(app)/trends/page.tsx` — **does not exist yet.**

- [ ] Weekly chart, four toggleable series (mood / sleep / energy / social).
- [ ] Each series plotted against the user's **own baseline band** (shaded),
      never a population average. Hard-code the band per series for now.
- [ ] Inline SVG or tiny lib; keep the chart visually quiet.
- [ ] Plain-language **insight sentence** directly beneath — the primary content.
- [ ] "Noticed patterns" list, 2–4 items, observations not judgements.
- [ ] "See everything stored about me" → plain-language record list with
      per-item delete (mutates local fixture + `localStorage`).
- [ ] Empty state ("check in for about a week and this fills in").
- [ ] Loading + error/retry.

**Backend later:** TREND agent owns baseline / slope / weekly insight; record
list + real delete from the store.

---

## Tab 4 — ME (profile & controls)   ❌

Route: `src/app/(app)/me/page.tsx` — **does not exist yet.**

- [ ] Language toggle → existing `useLanguage()` (EN / বাংলা / हिन्दी).
- [ ] Crisis plan display from `useCrisisPlan()` + edit form (reuse
      `StepCrisisPlan` field components) + `useSaveCrisisPlan()` mock mutation.
- [ ] Trusted contact from `useContact()`, editable, "doesn't have to be family"
      helper, never prefilled to parent/guardian.
- [ ] Data controls: see-everything view; delete-account-and-data confirm screen
      (type-to-confirm, clears `aimind.*`); retention statement.
- [ ] Permanent "talk to a real person" route (static "how referral works" +
      help sheet).
- [ ] Grouped section-list layout, tappable rows.

**Backend later:** real profile read/write; account deletion; referral creation.

---

## Persistent — NEED HELP NOW sheet   🟡 ~80%

Built in `src/help/` — `HelpNowLauncher`, `HelpNowButton`, `HelpNowSheet`,
`HelpNowGate`.

- [x] Persistent button, `fixed` bottom-right, `aria-haspopup="dialog"` /
      `aria-expanded`, focus returns to trigger on close.
- [x] Gate so onboarding steps 1–2 hide the button (`HelpNowGate` + wiring in
      `OnboardingRoute`).
- [x] Sheet: `role="dialog"`, `aria-modal`, focus trap, Escape to close,
      backdrop click to close.
- [x] Door 1 — Tele-MANAS `tel:14416` row.
- [x] Door 2 — Message chosen contact: disabled state when no contact; compose
      view with editable prefill, `navigator.share` / `sms:` fallback, copy.
- [x] Door 3 — Show me my plan: renders the three crisis-plan answers, empty
      state when none written.
- [x] Door 4 — Just stay with me row.
- [ ] **Door 4 behaviour is wrong**: currently `router.push("/talk")`. Spec says
      "routes nowhere, calls no one" — build an in-sheet calming view instead.
- [ ] `tel:14416` desktop fallback (show / copy the number on no-dialer).
- [ ] Reduced-motion pass on the sheet entrance (add the slide-up + guard it).
- [~] `bn` strings exist for every `help.*` key (type-enforced); **content
      audit** by a Bengali reader still pending.

**Backend later:** none.

---

## Onboarding — gaps in the existing flow   🟡 ~75%

`src/onboarding/` — `OnboardingRoute` drives 4 steps against the mock, seeded
from saved `step`, Back works, each step persists (refresh-resilient).

- [x] Step 1 — language selection (EN / বাংলা).
- [x] Step 2 — baseline: one item at a time, 0–3 answers, resume-at-first-
      unanswered, "x / 21" counter, reduced-motion aware auto-advance.
- [x] Step 3 — consent: four plain-language lines, "what's stored" disclosure,
      required checkbox gate.
- [x] Step 4 — crisis plan (3 textareas) + single trusted contact fieldset,
      required + phone validation, "doesn't have to be family" helper, completes
      onboarding and routes to `/today`.
- [x] Need Help Now appears from step 3 onward.
- [ ] **Add Hindi (`hi`)** as a third language: widen `Language` type
      (`"en" | "bn"` → `+ "hi"`), add `hi` dictionary (stub ok), third button.
- [ ] **Progress indicator** across the 4 steps (dots or "Step 2 of 4"), calm.
- [ ] Wire the remaining **18 DASS-21 items** once `src/content/instruments.ts`
      carries the published wording (component already loops — just needs data).
- [ ] Baseline: `aria-pressed` is set but arrow-key radio-group semantics are
      not — make the four options a proper radiogroup.

**Backend later:** replace mock `saveOnboardingStep` / `completeOnboarding`;
baseline answers seed the TREND baseline.

---

## Escalation & Screening — UI states   ❌

Build the screens now behind a dev toggle (`?sim=tier2` etc.); triggering is
backend.

- [ ] Tier 2 interstitial → fixture slot list → **preview-and-approve** of the
      exact shared brief → approve / decline (decline = no nagging).
- [ ] Tier 3A: crisis plan surfaced inline, option cards, nothing automatic.
- [ ] Tier 3B: full-screen **cancellable countdown**; cancel as prominent as the
      timer; any tap/keypress cancels; only timeout proceeds; reduced-motion safe.
- [ ] Post-tier-3 next-morning gentle check-in variant.
- [ ] In-conversation screening card (PHQ-9 / GAD-7 / ISI / DASS-21), one item at
      a time, progress, pause. PHQ-9 item 9 → SAFETY hand-off first.

**Backend later:** SAFETY / SCREENING / REFERRAL decide firing; supply slots,
brief content, follow-up scheduling.

---

## Counsellor console (desktop 1280px)   ❌

New route group `src/app/(console)/` with a desktop left-nav layout. Tabs:
Morning Queue / Student Brief / Caseload / Aggregate. All on fixture JSON in
`src/app/(console)/_mock/`.

- [ ] Morning Queue — ~12 rows ranked by *change*: Name / what moved / days /
      sparkline. Row → brief.
- [ ] Student Brief — one page, 60-sec read: what changed & when, screening
      scores w/ dates, 6-week trend, 2–3 dated quotes, self-help tried + outcome,
      tier-3 history, note field. "summary, not a diagnosis" header.
- [ ] Caseload — ongoing students, appointments, "drifting again after seen".
- [ ] Aggregate — anonymised + thresholded charts only; no drill-through.

**Backend later:** queue ranking + briefs assembled server-side; aggregate with
k-anonymity thresholds.
