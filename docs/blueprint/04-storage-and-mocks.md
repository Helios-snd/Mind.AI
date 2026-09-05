# 04 · Storage, mocks and the backend seams

---

## 1 · Every piece of durable state

Four keys, all prefixed `aimind.`. No `sessionStorage` anywhere. `me/wipe.ts` deletes by prefix, so it covers all four.

| Key | Written by | Shape |
|---|---|---|
| `aimind.onboarding.v1` | `api/mockClient.ts` | `OnboardingProgress` object. **Server-owned since slice A** — this key survives only inside `mockClient` |
| `aimind.today.v1` | `api/mockClient.ts` | `CheckIn[]`. **Server-owned since slice B** — `today/storage.ts` no longer persists anything, and no screen can read this key |
| `aimind.talk.thread.v1` | `talk/storage.ts:22` | `ChatMessage[]` |
| `aimind.talk.disclosureSeen.v1` | `talk/storage.ts:23` | the literal string `"1"` |

Every accessor is SSR-safe (`typeof window === "undefined"` guard) and corrupt-data safe (try/catch → `[]` or a default). Writes swallow quota errors silently.

`disclosureSeen()` returns `true` on the server, so the AI-disclosure banner never flashes during SSR.

### Payload shapes the backend must accept

```ts
// today/storage.ts — the comment says: "the payload a check-in POST should send"
type MoodValue = 1 | 2 | 3 | 4 | 5;
type CheckIn = {
  date: string;        // local day key
  at: string;          // ISO timestamp, also the delete handle
  mood: MoodValue;
  sleepHours: number;  // 0–12, step 0.5
  note: string;
};

// talk/storage.ts
type ChatMessage = {
  id: string;          // crypto.randomUUID(), else `${Date.now()}-${rand}`
  role: "user" | "assistant";
  text: string;
  at: string;
  status?: "sending" | "failed";
};

// trends/data.ts
type SeriesId = "mood" | "sleep" | "energy" | "social";
type WeekPoint = { weekStart: string; mood: number; sleep: number; energy: number; social: number };
```

Entries are sorted by `at.localeCompare` and filtered through an `isCheckIn` type guard on every read.

---

## 2 · The mock "backend" — `src/api/mockClient.ts`

102 lines. One module-level `let progress: OnboardingProgress = load()`, seeded from localStorage at import time.

- `LATENCY_MS = 300` — **every** method awaits exactly 300 ms, no jitter.
- `mockClient.shouldFail = true` from the console makes every method throw `Error("mock: request failed")`. That is the only failure mode — no status codes, no network-error distinction.
- **No seed fixtures.** A fresh browser gets `{ step: 1 }` and `null` for plan and contact. Everything returned is what the user typed.
- **No risk detection, no keyword matching, no NLP of any kind lives here.**

| Method | Writes | Returns |
|---|---|---|
| `getOnboardingProgress()` | no | `structuredClone(progress)` |
| `saveOnboardingStep(patch)` | yes | **shallow** merge `{...progress, ...patch}` |
| `completeOnboarding()` | yes | stamps `completedAt`. **Does not validate that steps 1–4 were filled** |
| `getCrisisPlan()` / `getContact()` | no | clone or `null` |
| `saveCrisisPlan(plan)` / `saveContact(contact)` | yes | the sub-object, **not** the progress |
| `_reset()` | yes | `{ step: 1 }`, then persists — **not on `ApiClient`** |

**The shallow merge matters.** A partial `crisisPlan` would replace rather than deep-merge. The UI always sends complete sub-objects, so it never bites today — but the real server should deep-merge so it stops being lossy.

---

## 3 · The eight `TODO(backend)` seams

These are the integration points, verbatim.

| Location | Comment |
|---|---|
| `today/reflect.ts:11-12` | `TODO(backend): replace with the COMPANION response; SAFETY may pre-empt this entirely with an escalation view.` |
| `today/storage.ts:7-8` | `TODO(backend): replace load/save with the SIGNAL + TREND endpoints. The shape below is the payload a check-in POST should send.` |
| `today/NoteField.tsx:49-51` | `TODO(backend): POST the Blob to the self-hosted STT service, then onChange(...)` |
| `talk/storage.ts:7-8` | `TODO(backend): replace load/save with the COMPANION thread endpoints. SAFETY reads every inbound message server-side and may inject a crisis interstitial.` |
| `talk/replies.ts:11` | `TODO(backend): replace with the streamed COMPANION response over full history.` |
| `talk/Composer.tsx:64-65` | `TODO(backend): POST the Blob to the self-hosted STT service, then setText(...)` |
| `trends/data.ts:12-13` | `TODO(backend): TREND owns the baseline (seeded from the DASS-21 baseline and the first weeks), the slope detection, and the weekly insight sentence.` |
| `me/wipe.ts:7-8` | `TODO(backend): call the account-deletion endpoint; the server erases the record and the referral history.` |

Plus `useVoiceCapture.ts:16` — `const blob = await voice.stop(); // TODO(backend): send blob to STT` — and two in `instruments.ts` about the 18 missing DASS-21 items.

---

## 4 · The three fixture files

### `talk/replies.ts` — the Companion stand-in

Header: *"Fixture stand-in for the COMPANION agent. … It never names a condition and never mentions medication — those are hard constraints the real agent also holds."*

`replyKeyFor(text: string, userTurn: number): Keys` — 8 rules, **first match wins**, all trilingual (English / Bengali / romanised Bengali):

| # | Matches on | → key |
|---|---|---|
| 1 | `hi\|hey\|hello\|yo`, হ্যালো, হাই, নমস্কার, কেমন আছ | `talk.reply.greeting` |
| 2 | `ghabra(hat)`, `bechain`, anxious, panic, restless, on edge, ঘাবড়, উদ্বেগ, অস্থির, টেনশন | `talk.reply.anxiety` |
| 3 | chest, breath, heart racing, palpitation, buke, বুকে, শ্বাস, ধড়ফড় | `talk.reply.somatic` |
| 4 | nothing feels good, `kichu bhalo`, `bhalo lagche na`, numb, empty, **hopeless**, **pointless**, কিছু ভালো লাগছে না, শূন্য | `talk.reply.lowMood` |
| 5 | sleep, insomnia, awake, tired all, exhaust, ঘুম, ক্লান্ত | `talk.reply.sleep` |
| 6 | exam, viva, result, assignment, deadline, semester, পরীক্ষা, রেজাল্ট | `talk.reply.exam` |
| 7 | lonely, alone, no one, isolated, left out, একা, নিঃসঙ্গ, কেউ নেই | `talk.reply.lonely` |
| 8 | thank, thanks, ধন্যবাদ | `talk.reply.thanks` |

Fallback alternates on `userTurn % 2`: **"I'm listening. What's underneath that, if you had to guess?"** / **"Thank you for telling me. Can you say a bit more about that?"**

> **Note rule 4.** `"hopeless"` and `"pointless"` route to an ordinary low-mood reply. There is no crisis branch anywhere in this file, or in the repository.

### `today/reflect.ts` — the acknowledgement stand-in

`reflect(entry): Reflection` — four ordered branches, first match wins:

1. `EXAM_HINTS` regex in the note (7 patterns: `exams?`, `viva`, `results?`, `assignments?`, `deadlines?`, পরীক্ষা, পড়া) → exam ack + **"Put it on paper"**
2. `sleepHours > 0 && sleepHours < 5` → low-sleep ack + **"A wind-down tonight"**
3. `mood <= 2` → low-mood ack + **"One small, doable thing"**
4. `mood === 3` → mid-mood ack + **"A slow minute"** (5-4-3 grounding)
5. else → good-mood ack, `suggestion: null`

### `trends/data.ts` — the Trend stand-in

Hardcoded 6-week arc, deliberately declining then slightly recovering:

```
mood   3.6  3.4  3.1  2.6  2.3  2.5
sleep  7.4  7.0  6.3  5.6  5.1  5.9
energy 3.5  3.3  3.0  2.5  2.2  2.4
social 3.4  3.0  2.8  2.3  2.0  2.2
```

Hardcoded baseline bands: mood `[2.5, 4]` · sleep `[6, 8]` · energy `[2.5, 4]` · social `[2.5, 4]`.

`buildTrends()` stamps these onto the last six Mondays, then **overwrites only the final week's `mood` and `sleep`** with the rounded average of this week's real check-ins. `energy` and `social` are **never real** — nothing in the app collects them, yet they render with a "your usual range" band.

Insight and patterns are fixed keys: `trends.insight`, `trends.pattern.1-3`.

---

## 5 · React Query configuration — read before changing

```ts
// src/app/providers.tsx:13-14
queries: { staleTime: Infinity, gcTime: Infinity, retry: 1, refetchOnWindowFocus: false }
```

The comment is explicit: *"The Help Now sheet must read plan + contact from cache with no network, so cached data never goes stale on its own."*

**No hook ever calls `invalidateQueries` or `refetch`.** Every mutation writes the response straight into the cache with `setQueryData`. The only `refetch()` in the repo is the onboarding error-retry button.

Consequence: **the app never re-reads from the client after first mount.** A server that mutates state independently — Safety injecting an escalation, a counsellor updating a record — would never be observed by this UI. This is fine for onboarding, and must be renegotiated when the Talk slice lands. Whatever replaces it, the Help Now sheet's no-loading-gate behaviour is the acceptance test.

---

## 6 · Debug backdoors that ship in production

| Flag | Location | Effect |
|---|---|---|
| `window.__talkFail` | `talk/page.tsx:65-67` | Forces the next send to fail |
| `?demo=1` | `trends/page.tsx:21-23` | Shows the full fixture chart with zero check-ins |
| `mockClient.shouldFail` | `mockClient.ts:44` | Makes every API call throw |

The first two are undocumented and reachable by any user.
