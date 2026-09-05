# 03 · UI state machines

Every one of these must behave identically after the backend swap. They are the behavioural contract.

---

## 1 · Talk message lifecycle

```ts
// src/app/(app)/talk/storage.ts:13-20
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  status?: "sending" | "failed";   // absent once delivered
};
```

```
   compose ──send──► sending ──┬──ok──► (status deleted)
                               │
                               └─fail─► failed ──retry──► sending
                                          │
                              page reload │
                                          ▼
                              (sending → failed on load)
```

**`storage.ts:44-47`**: on load, any message still `"sending"` is rewritten to `"failed"` — *"A message caught mid-send by a refresh is treated as failed."*

The `failed` bubble dims to `opacity-60` and renders a retry button reading `` `${t("talk.failed")} ${t("talk.retry")}` `` → **"Didn't send. Try again"**.

### The fake network, `talk/page.tsx:62-98`

```ts
const forceFail = (window as unknown as { __talkFail?: boolean }).__talkFail;
const delay = reduced ? 300 : 700 + Math.random() * 700;
```

Typing indicator: under reduced motion, plain text `t("talk.typing")`; otherwise three dots with `animationDelay` `0 / 150 / 300` ms.

---

## 2 · Today

```
  entries === null            ← loading sentinel
        │
        ▼
  todays && !reopened ──yes──► Acknowledgement ──"Add something more"──► reopened
        │ no                                                                  │
        ▼                                                                     │
  [returning banner if daysSince >= 2]  ◄─────────────────────────────────────┘
        │
        ▼
  CheckInForm ──submit──► saveCheckIn ──► Acknowledgement
```

- `entries: CheckIn[] | null` — `null` means loading, not empty (`:25`).
- `returning` is true when there is no entry today **and** the previous entry is `daysSince >= 2` (`:44`). Copy: **"Good to see you back."** / **"Nothing to catch up on. Let's just do today."**
- Submit builds `{...draft, date: todayKey(), at: new Date().toISOString()}`.
- Form submit is disabled while `mood === null`. `DEFAULT_SLEEP = 7`.

### MoodScale — `role="radiogroup"`, roving tabindex

Five `role="radio"` buttons, `aria-checked`. `tabIndex` follows the selection, or **mood 3** when nothing is selected. Keyboard (`:51-60`): ArrowRight/Up → `Math.min(5, current+1)`; ArrowLeft/Down → `Math.max(1, current-1)`; `current = value ?? 3`. Selected label echoed in an `aria-live="polite"` line.

Labels: Really low / Low / Somewhere in the middle / Pretty good / Really good.

### SleepSlider
`MIN 0`, `MAX 12`, `STEP 0.5`. `value < 1` → "less than an hour"; else "about {hours} hours", where half-hours render as `` `${n(Math.floor(value))}½` ``. `aria-valuetext` carries the readout.

---

## 3 · Voice capture — `src/lib/useVoiceCapture.ts`

```
  unsupported ◄── no getUserMedia / no MediaRecorder (checked on mount)

  idle ──start()──► requesting ──granted──► recording ──stop()──► idle
                        │                       │
                     denied                  cancel()
                        │                       │
                        ▼                       ▼
                     denied ────────────────► idle
```

`type VoiceState = "idle" | "requesting" | "recording" | "denied" | "unsupported"`. Returns `{ state, seconds, start, stop, cancel }`; `seconds` ticks on a 1000 ms interval. `stop()` resolves `Promise<Blob | null>` — `null` when nothing was recording. `cancel()` preserves `"unsupported"`.

**Both call sites discard the Blob** (`NoteField.tsx:47-54`, `Composer.tsx:62-68`). The file comment is explicit: transcription is a backend job, because *"audio must not leave controlled infrastructure."*

Hint copy after a recording: **"Recorded. Turning speech into text happens once the backend is connected — type or edit here for now."**

---

## 4 · Help Now sheet — `src/help/HelpNowSheet.tsx`

```
  closed ──pill tap──► list ──┬──► compose ──back──┐
                              │                    │
                              ├──► plan ──back─────┤
                              │                    │
                              └──► /talk           │
                                   (closes sheet)  │
                              ◄───────────────────-┘
```

`type View = "list" | "compose" | "plan"`.

**Four doors, in order:**

| # | Door | Behaviour |
|---|---|---|
| 1 | Call Tele-MANAS — 14416 | `<a href="tel:14416">` |
| 2 | Message {name} | `setView("compose")`; **disabled** with "Add someone in your profile first." when `contactResolved && !hasContact` |
| 3 | Show me my plan | `setView("plan")` |
| 4 | Just stay with me | `onClose()` then `router.push("/talk")` |

**Door 4 is implemented against spec.** `FEATURES.md` says it "routes nowhere, calls no one"; `docs/frontend-todo.md` confirms this as an open defect. It currently navigates to `/talk`.

**No loading gate anywhere in the sheet** (`:28-29`) — rows render immediately and names fill in when the cache resolves. This works only because `providers.tsx` sets `staleTime: Infinity`. **Any redesign of the caching strategy must re-verify this screen first.**

Accessibility: `role="dialog"`, `aria-modal="true"`, a manual Escape + Tab focus trap (`:44-70`), focus-first-element on every `view` change, and focus return to the trigger on close.

`ComposeView`: textarea prefilled with **"I'm not doing okay right now and I didn't know who to tell. Can you call me?"**; sends via `navigator.share({text})` when available, else `sms:${phone}?body=…`; plus a copy button toggling "Copy the message" → "Copied".

---

## 5 · Onboarding — `src/onboarding/OnboardingRoute.tsx`

```
  progress.isLoading || step === null  ──►  OnboardingLoading
  progress.isError                     ──►  OnboardingError (Try again → refetch)
  data.completedAt                     ──►  OnboardingLoading + replace("/today")

  1 Language ──► 2 Baseline ──► 3 Consent ──► 4 Crisis plan ──► complete ──► /today
       ◄─── back ────┴──── back ──────┴──── back ─────┘
```

- `step: OnboardingStep | null`. **Seeded from `progress.data.step` once, then user-driven** so Back works without losing saved answers (`:29-30`).
- `goTo(next, patch)` persists **then** advances: `await save.mutateAsync({step: next, ...patch})` → `setStep(next)`.
- `back()` decrements **without persisting**.
- **Help Now pill gating (`:43-46`):** `setVisible(step !== null && step >= 3)`, cleanup restores `true`. The pill is hidden on steps 1–2 and appears from consent onward.
- Step 4 submit: `save.mutateAsync({crisisPlan, contact})` → `complete.mutateAsync()` → `router.push("/today")`.

**Refresh-resilience at every step is an acceptance requirement** (`mockClient.ts:5-9`). It must survive the backend swap.

### StepBaseline
`ADVANCE_DELAY_MS = 250`, or immediate under reduced motion. `index` seeds to the first unanswered item. `locked` prevents double-tap during save + advance. Counter reads `{current} / {total}` using **`DASS21_TOTAL` (21)** while the loop uses `DASS21.length` (3).

### Validation — shared by StepCrisisPlan and ContactControl
All fields required → **"This one is needed before we finish."**; then `phoneLooksValid` → **"A phone number with the digits, please. Spaces and a +91 are fine."**

---

## 6 · Trends

`ready` / `enough` booleans; `trends` memoised from `ready && enough ? buildTrends() : null`.

```
  !ready                  ──► "One moment."
  ready && !enough        ──► empty card: "Not enough yet." / "Check in for about a week…"
  ready && enough         ──► chart + insight + patterns + /data link
```

Gate: `hasEnoughData()` = `loadCheckIns().length >= 3` (`MIN_CHECKINS = 3`).

**Backdoor:** `/trends?demo=1` forces `enough = true`, showing the full fixture chart with zero check-ins (`:21-25`).

`TrendChart` holds one piece of state: `active: SeriesId`, initialised `"mood"`. Tabs are `role="tablist"` / `role="tab"` with `aria-selected`. No tooltips, no interaction beyond the tabs.

---

## 7 · Async state vocabulary — `src/onboarding/states.tsx`

*"The three non-success states every async surface in onboarding shows. (The fourth, success, is the screen itself.)"*

| Export | Renders |
|---|---|
| `OnboardingLoading` | `<p role="status">` **"One moment."** |
| `OnboardingEmpty` | `<p>` **"Nothing here yet."** — **exported, never imported** |
| `OnboardingError({onRetry})` | `<div role="alert">` **"Something did not load. You can try again."** + "Try again" |
| `OnboardingShell` | `container-x flex min-h-[70vh] max-w-xl flex-col justify-center py-12` |

`docs/frontend-todo.md` open item: promote these to a generic `AsyncState` before reuse in the tabs.
