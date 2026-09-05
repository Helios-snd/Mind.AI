# 09 · Slice order and the change contract

---

## 1 · The rule

```
              EXISTING MIND.AI UI
                     │
                     │  frozen by default
                     ▼
             existing component
                     │
             existing hook / ApiClient
                     │
                     ▼
                REAL BACKEND
                     │
          ┌──────────┴──────────┐
      PostgreSQL            AI layer (self-hosted)
```

**Frozen by default.** A slice may change the UI only via an entry in its own change register, and each entry must state *why the architecture requires it*. If a slice appears to need an unlisted UI change, that is a finding to raise against this blueprint — not a change to make silently.

### The freeze check

```bash
git diff --stat src/components src/help src/content src/data src/lib \
                src/app/\(marketing\)
```

Anything appearing here that is not in the current slice's register is a regression.

---

## 2 · Slice 1 — auth, the gate, onboarding

The only slice with a UI change register, because it is the one that installs the two-layer architecture.

### Backend
Foundation (`app factory`, config, logging, errors, security, db session, `/api/v1` router, `/healthz`), then `modules/auth`, `modules/users`, `modules/onboarding`. Ten tables, one migration. See `06-db-schema.md §10`.

### Frontend change register

| # | Change | Why |
|---|---|---|
| 1 | `middleware.ts` (new, root) — the single gate | Replaces four duplicated guards; `/data`, `/human`, `/me/delete` gain protection they never had |
| 2 | Delete the soft guards at `today:33`, `talk:40`, `trends:28`, `me:32` | Superseded by #1. Already requested by `docs/frontend-todo.md` |
| 3 | `(marketing)/layout.tsx` — `TabDock` only for an onboarded session | Defect 1: logged-out visitors currently see the student tabs |
| 4 | Converge "start" destinations on `/onboarding` (`login:41`, homepage secondary) | Defect 10: three different destinations |
| 5 | `(marketing)/login/page.tsx` — stub becomes a real email/phone + OTP form | The return flow needs an entry point. Markup and styling kept; handlers added |
| 6 | New step 5 `StepClaim.tsx`; `OnboardingStep` widens to `1\|2\|3\|4\|5` | "Keep your account", skippable — the recovery path for anonymous accounts |
| 7 | Extract `Scale5` from `MoodScale.tsx` | Energy and social reuse it rather than becoming two near-copies |
| 8 | `CheckInForm` + `today/storage.ts` gain `energy`, `social` | Makes the four-series chart real instead of fabricated (defect 3) |
| 9 | `httpClient.ts` (new); `client.ts` gains `deleteAllData()`; `hooks.ts:7` env switch; `wipe.ts` uses the interface | Closes the abstraction leak (defect 5) |
| 10 | `next.config.mjs` — rewrite `/api/v1/*` to the backend | Makes the session cookie first-party; removes CORS entirely |

Every new i18n key lands in **both** `en.ts` and `bn.ts`. `satisfies Record<Keys, string>` makes a missing Bengali key a compile error; a native-reader pass is still owed (open item in `frontend-todo.md`).

### Verification
See the plan's verification section. The load-bearing checks: **nothing is minted by browsing the public site**, the gate fires only on protected routes, refresh mid-onboarding resumes at the saved step, the Help Now sheet still renders plan and contact with no loading gate, and the freeze check is clean.

---

## 3 · Remaining slices

| # | Slice | Delivers | Watch for |
|---|---|---|---|
| 2 | **Today** | `POST /checkins`, Signal extraction, real acknowledgement | The `reflect.ts` fixture dies here. Safety must already read the note in parallel — do not ship a check-in path with no risk pass |
| 3 | **Talk** | Streamed Companion over full history, **Safety independent and parallel**, thread persistence | `staleTime: Infinity` must be renegotiated. Acceptance test is the Help Now sheet still rendering with no loading gate |
| 4 | **Trends** | Real baselines, drift, weekly insight. `trends/data.ts` fixture deleted | Baseline is the student's own history, never a population average. Do not plot a series with insufficient observations |
| 5 | **Me / Data / Human** | Profile, usage history, real export and deletion | `/data` must list everything actually stored, per the consent copy. Per-item delete must really delete |
| 6 | **Screening** | The 18 missing DASS-21 items, **validated Bangla**, real scoring, subscales, cut-offs; conversational delivery | Do not invent items. PHQ-9 item 9 routes through Safety first. Student sees plain language, never a label |
| 7 | **Care** | Guided self-help modules, exam-period mode | "Guided self-help", never "AI therapy" |
| 8 | **Referral** | Matching, slots, brief, student approval, follow-up | `released_to_counsellor_at` stays null until the student approves |
| 9 | **Escalation UI** | Tier 2 interstitial, tier 3A, tier 3B countdown, post-event check-in | Currently ❌ not started. Cancel as prominent as the countdown; only silence proceeds |
| 10 | **Counsellor console** | Morning queue ranked by **change**, one-page brief, caseload | Currently zero files. New `(console)` route group — the one place new UI is expected |
| 11 | **Institution aggregates** | Anonymised, k-anonymity thresholded | Never enough to identify anyone |
| 12 | **Hardening** | Rate limits, retention purge, backups, monitoring, CI, deployment | The repo has none of these today |

### Why Safety is at slice 3 and escalation at slice 9

Safety needs a conversation pipeline to run on; the escalation *UI* needs tiers to display. But Safety itself — the parallel risk pass — ships **with Talk in slice 3**, not at slice 9. Slice 9 is the interface for something that already works underneath.

**Until slice 3 ships, the product has no risk detection at all. No demo may present it as safety-capable before then.**

---

## 4 · Debt to clear along the way

Tracked here so it is not rediscovered slice by slice.

| Item | Where | Slice |
|---|---|---|
| Remove `window.__talkFail` and `?demo=1` backdoors | `talk:65`, `trends:21` | 3, 4 |
| Header dropdowns unreachable by keyboard and touch | `Header.tsx:25-41` | any — accessibility, not architecture |
| `prose-mindai` is undefined | `privacy-policy:12` | any |
| `Placeholder.tsx`, `OnboardingEmpty`, `useSetHelpNowVisible`, `NavGroup.href` unused | various | any |
| Promote `Onboarding{Loading,Error,Empty}` to a generic `AsyncState` | `states.tsx` | 2 |
| Help Now door 4 navigates to `/talk`; spec says it routes nowhere | `HelpNowSheet:73-76` | 9 |
| `tel:14416` desktop fallback (show/copy when no dialer) | `HelpNowSheet:119` | 9 |
| Helpline drift — `1-800 891 4416` vs Tele-MANAS `14416` | `nav.ts:70` | any |
| Add Hindi (`hi`) — widen `Language`, add dictionary, third button | `types.ts:1` | 6 |
| Onboarding progress indicator across steps | `OnboardingRoute` | 1 or 6 |
| `/data`, `/human`, `/me/delete` use `gray-*` not brand tokens | those files | 5 |
| Marketing site 100% untranslated | `(marketing)/**` | post-12 |
| FAQ 14 answers, article bodies, T&C — content, not code | `faq.ts`, articles | content team |
| No tests, no eslint, no CI, no Docker | repo root | 12 |

---

## 5 · Definition of done, per slice

1. Backend module with tests that pass.
2. Migration applies cleanly forward **and** rolls back.
3. The real UI exercises the path end to end — not curl alone.
4. Freeze check clean, or every diff accounted for in the slice's register.
5. Nothing in `08-safety-and-privacy.md §3` weakened.
6. Blueprint updated where the slice changed a documented fact.

Point 6 matters most. A blueprint that drifts from the code is worse than no blueprint, because the next slice will trust it.
