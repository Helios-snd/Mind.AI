# 00 · Overview

> **This directory is the frozen baseline.** It records what the Mind.AI frontend *is*, exactly, as of the commit that introduced it. Every backend slice is verified against these documents rather than against memory. If an implementation appears to require a UI change, that is a finding to raise against this blueprint — not a change to make silently.

Audited at commit `81c4683`. 91 source files, ~8,200 LOC.

---

## 1 · The premise

From `plan.pdf` ("Care before crisis") and `FEATURES.md`: a campus-first, multi-agent mental-health companion that sits between *"I'm not doing well"* and *"I need to see a psychiatrist"*, and knows when to stop being an app.

The product is **the handoff to a human**. Everything else supports it.

> A counsellor at a college of four thousand students can only see the people who walk in. We talk to everyone daily, and every morning we hand her the twelve who need her most.

Two economic facts shape the architecture: the **institution pays and the student never does**, and the **counsellor console is the half that gets bought** while the student app is the half that earns trust.

---

## 2 · The two-layer product

```
                    PUBLIC LAYER                    GATED LAYER
                    (no account)                    (account + onboarding)

  Home ─┬─ About / FAQ                              Today ─┬─ check-in
        ├─ Services (Depression/Anxiety/ADHD)       Talk ───┤
        ├─ Resources                                Trends ─┤
        ├─ Our Experts                              Me ─────┤
        ├─ Careers / Contact / Volunteer            Data ───┤
        └─ Privacy / Terms                          Human ──┘
                    │
                    └── "Start your Journey" ──► ONBOARDING ──► gated layer
```

The gate fires **only when someone tries to enter a protected feature**, never on arrival at the public site. See `01-routes-and-access.md`.

---

## 3 · Three parts, three states of completeness

| Part | Files | State |
|---|---|---|
| **Marketing site** `src/app/(marketing)/` | 19 routes | Mixed — 11 real pages, 8 stubs or content-empty |
| **Student app** `src/app/(app)/` | 8 routes | Built as UI, backed entirely by `localStorage` and fixtures |
| **Counsellor console** | — | **Does not exist.** Zero files, no `(console)` route group |

---

## 4 · Real vs fixture

The single most important distinction in this codebase. **Nothing is backed by a server.** There are zero `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` or `axios` calls anywhere in `src/`, zero `process.env` reads, no `src/app/api/`, no route handlers, no server actions, and no `.env*` file.

### The seven agents, as specified vs as built

| Agent | Specified role | What actually exists |
|---|---|---|
| **Companion** | Conversation. Warm, remembers, never diagnoses | Chat is still 8 first-match regexes (`talk/replies.ts`). The check-in acknowledgement moved server-side in slice B (`checkins/reflection.py`) — same five rules, now behind the response contract COMPANION will fill |
| **Signal** | Structured extraction from free text | **Built, slice B.** `checkins/signals.py` — structured answers stored verbatim, note-derived observations kept separate and additive |
| **Trend** | Personal baseline, slope detection, weekly insight | Hardcoded 6-week array, 4 hardcoded baseline bands, 1 fixed insight sentence, 3 fixed patterns (`trends/data.ts`) |
| **Screening** | PHQ-9, GAD-7, ISI, DASS-21 delivered conversationally, triggered by drift | **Partly built, slice A.** All 21 DASS-21 items, real subscale scoring and published cut-offs in `screening/scoring.py`. Still a static onboarding form, not conversational, and not drift-triggered. PHQ-9 / GAD-7 / ISI absent |
| **Care** | Behavioural activation, sleep scheduling, grounding, reframing | Static suggestion keys returned by `checkins/reflection.py`. No modules, no exam-period mode |
| **Safety** | Reads every message independently and in parallel; cannot be overridden | **Nothing** |
| **Referral** | Counsellor matching, slots, clinical brief, follow-up | **Nothing** |

### The consequence that matters most

**No self-harm or risk detection exists on any input path.** Grepping `suicid|self.harm|escalat|risk` across `src/` returns only TODO comments naming the future Safety agent. In `talk/replies.ts`, the strings `"hopeless"` and `"pointless"` match the *low-mood* regex and receive a generic supportive reply.

This is the widest gap between specification and code in the repository, and it sits exactly where the stakes are highest. **No demo may present the app as safety-capable until the Safety slice ships.**

---

## 5 · Defect register

Carried forward so no slice silently inherits one.

| # | Defect | Location |
|---|---|---|
| 1 | ~~`TabDock` renders on every marketing page~~ — **fixed, slice A.** `StudentDock` gates on the `mind_stage` hint cookie | `(marketing)/layout.tsx` |
| 2 | ~~Guard duplicated in four files, missing from `/data`, `/human`, `/me/delete`~~ — **fixed, slice A.** Single gate in `src/middleware.ts`; all seven routes covered | `src/middleware.ts` |
| 3 | ~~`energy` and `social` were fiction~~ — **fixed, slice B.** Both are collected, persisted and stored as structured signals; the current week is real. The five historical weeks remain fixture until slice C | `trends/data.ts` |
| 4 | ~~DASS-21 counter reads `1 / 21` while iterating 3 items~~ — **fixed, slice A.** All 21 items present, so the denominator is now true | `instruments.ts` |
| 5 | ~~`wipe.ts` calls `mockClient._reset()`, not on `ApiClient`~~ — **fixed, slice A.** The interface gained `deleteAllData()` | `me/wipe.ts` |
| 6 | ~~`wipeEverything()` re-writes the key it just deleted~~ — **fixed, slice A.** `_reset()` no longer persists | `me/wipe.ts` |
| 7 | Debug backdoors — **`?demo=1` removed in slice B** when Trends moved to the API. `window.__talkFail` remains until the Talk slice | `talk/page.tsx:65` |
| 8 | Header dropdowns are `<button>` with no `onClick` / `aria-expanded` / `aria-haspopup` — CSS `group-hover` only, so **keyboard- and touch-unreachable** at `lg` | `Header.tsx:25-41` |
| 9 | `staleTime: Infinity` + `gcTime: Infinity` + **zero `invalidateQueries` anywhere**. Deliberate, so Help Now reads from cache with no network — but a server-side mutation could never reach the UI | `providers.tsx:13-14` |
| 10 | Three different "start" destinations: `/onboarding`, `/find-your-doctor`, both on the homepage | `Header.tsx:66`, `login:41` |
| 11 | Helpline drift — `EMERGENCY_HELPLINE = "1-800 891 4416"` vs **Tele-MANAS `14416`**. Two different services | `nav.ts:70` vs `en.ts:85` |
| 12 | Marketing site is **100% untranslated**; i18n covers only `(app)` + Help Now | `src/i18n/` |
| 13 | Both voice call sites `await voice.stop()` and **discard the Blob** — by design, STT is a backend job | `NoteField.tsx:47`, `Composer.tsx:62` |
| 14 | Bengali DASS items are unvalidated working translations — **still open, now explicit.** `BANGLA_DASS21_VALIDATED = false`, and every `bn` scoring run carries `instrument_validated = false`. A `bn` score is not a clinical result | `instruments.ts`, `screening/service.py` |
| 15 | `Placeholder.tsx`, `OnboardingEmpty`, `useSetHelpNowVisible`, `queryKeys` (outside its own file) and `NavGroup.href` are all exported and never used | various |

---

## 6 · Hard constraints

From `FEATURES.md`. These are **constraints, not features**. A demo deadline does not erode them.

1. Never diagnoses. Says what it observed and what a professional might help with.
2. Never advises on medication — not dosage, starting, stopping, or interactions. Routes every such question to a human.
3. Discloses that it is an AI clearly at the start, and again if a student seems to have forgotten. **Not on every message.**
4. Does not attempt to talk someone out of a crisis. At tier 3 it stops being clever and starts connecting.
5. Crisis detection runs **independently** of the conversational model and cannot be suppressed by it.
6. Every tier-3 event gets human review, including the ones that turned out to be nothing.
7. Does not claim to detect emotion from voice or face. Transcription yes; affect inference from acoustics, no.
8. Always a visible route to a human, on every screen, whatever tier the student is in.
9. The trusted contact is never defaulted to a parent.
10. The college never reads an individual conversation. Administration sees only anonymised, thresholded aggregates.
11. No streaks, badges, points, or penalty animations. Punishing someone for missing a day when they are depressed is exactly backwards.

---

## 7 · How to read this directory

| File | Contents |
|---|---|
| `01-routes-and-access.md` | Every route, its file, its kind, and its public/protected classification |
| `02-components-and-tokens.md` | Shared component signatures, the exact design-token table, CSS primitives |
| `03-state-machines.md` | Every status enum and screen state machine, verbatim |
| `04-storage-and-mocks.md` | The 4 localStorage keys, all 8 `TODO(backend)` seams, the 3 fixture files |
| `05-api-contract.md` | The current `ApiClient` and the full target REST surface |
| `06-db-schema.md` | Target schema, marked by slice |
| `07-agents.md` | The seven agents and the self-hosted provider abstraction |
| `08-safety-and-privacy.md` | Three tiers, the privacy wall, DPDP Act 2023 |
| `09-slice-order.md` | Vertical-slice sequence and per-slice verification |
