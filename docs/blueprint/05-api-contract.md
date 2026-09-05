# 05 · API contract

---

## 1 · The contract as it exists

`src/api/client.ts` — the whole thing. **Seven methods.**

```ts
export interface ApiClient {
  getOnboardingProgress(): Promise<OnboardingProgress>;
  saveOnboardingStep(patch: Partial<OnboardingProgress>): Promise<OnboardingProgress>;
  completeOnboarding(): Promise<OnboardingProgress>;
  getCrisisPlan(): Promise<CrisisPlan | null>;
  getContact(): Promise<TrustedContact | null>;
  saveCrisisPlan(plan: CrisisPlan): Promise<CrisisPlan>;
  saveContact(contact: TrustedContact): Promise<TrustedContact>;
}
```

`src/api/types.ts` — the whole thing. **These are the wire shapes. camelCase is part of the contract.**

```ts
export type Language = "en" | "bn";

export type CrisisPlan = { whoIdCall: string; whatHelps: string; whatMakesItWorse: string };

export type TrustedContact = { name: string; relationship: string; phone: string };

export type BaselineAnswer = { itemId: string; value: 0 | 1 | 2 | 3 };

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingProgress = {
  step: OnboardingStep;
  language?: Language;
  baseline?: BaselineAnswer[];
  consentAt?: string;
  crisisPlan?: CrisisPlan;
  contact?: TrustedContact;
  completedAt?: string;
};
```

`step` is the only required field. `completedAt`'s presence is the app-wide onboarding gate.

### Two structural facts

**There is no client selection mechanism.** No factory, no base URL, no env var, no auth header, no user id. `client.ts` exports zero runtime values. Selection is one line:

```ts
const api = mockClient;   // src/api/hooks.ts:7
```

**There is no notion of a user.** Every method is nullary or takes only a payload. The interface is implicitly single-user and device-scoped. `FEATURES.md` lists "real authentication" under EXPLICITLY NOT BUILDING, so this was deliberate.

### The one abstraction leak

`me/wipe.ts:19` imports `mockClient` directly and calls `_reset()`, which is **not on `ApiClient`**. Swapping in a real client breaks this file at compile time. Closing it is part of slice 1.

---

## 2 · The hooks — `src/api/hooks.ts`

| Hook | Kind | Key | Consumers |
|---|---|---|---|
| `useOnboardingProgress` | query | `["onboarding"]` | `today:23` `trends:15` `me:30` `data:25` `talk:24` `i18n/index:38` `OnboardingRoute:24` |
| `useSaveOnboardingStep` | mutation | writes all three keys | `i18n/index:39` (language), `OnboardingRoute:25` |
| `useCompleteOnboarding` | mutation | writes `["onboarding"]` | `OnboardingRoute:26` |
| `useCrisisPlan` | query | `["crisisPlan"]` | `CrisisPlanControl:36`, `HelpNowSheet:31` |
| `useContact` | query | `["contact"]` | `ContactControl:13`, `HelpNowSheet:30` |
| `useSaveCrisisPlan` | mutation | `["crisisPlan"]` + patches `["onboarding"]` | `CrisisPlanControl:37` |
| `useSaveContact` | mutation | `["contact"]` + patches `["onboarding"]` | `ContactControl:14` |

`useSaveOnboardingStep` mirrors `data.crisisPlan` and `data.contact` into their own caches when present — so step 4 keeps all three aligned.

`queryKeys` is exported but **never imported outside its own file**.

---

## 3 · Target REST surface

Base `/api/v1`. Proxied same-origin through Next (`next.config.mjs` rewrite) so the session cookie is first-party and there is no CORS.

### Auth

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/anonymous` | Mints an anonymous account. Called lazily by `httpClient` on 401 or missing session, then the original request is retried **once** |
| `POST` | `/auth/claim` | Attach email or phone to the current anonymous account → sends OTP |
| `POST` | `/auth/login` | Start return flow for a claimed identity → sends OTP |
| `POST` | `/auth/verify` | Consume OTP → session cookie |
| `POST` | `/auth/refresh` | Rotate the refresh token |
| `POST` | `/auth/logout` | Revoke session, clear cookie |

Session is an **httpOnly, SameSite=Lax** cookie. No token is ever readable from JavaScript.

### Onboarding and profile — slice 1

| Method | Path | Replaces | Returns |
|---|---|---|---|
| `GET` | `/onboarding` | `getOnboardingProgress()` | `OnboardingProgress` |
| `PATCH` | `/onboarding` | `saveOnboardingStep(patch)` | **full merged** `OnboardingProgress` |
| `POST` | `/onboarding/complete` | `completeOnboarding()` | `OnboardingProgress` |
| `GET` | `/crisis-plan` | `getCrisisPlan()` | `CrisisPlan \| null` |
| `PUT` | `/crisis-plan` | `saveCrisisPlan(plan)` | `CrisisPlan` |
| `GET` | `/trusted-contact` | `getContact()` | `TrustedContact \| null` |
| `PUT` | `/trusted-contact` | `saveContact(contact)` | `TrustedContact` |
| `GET` | `/me` | — | profile |
| `DELETE` | `/me/data` | `mockClient._reset()` | `204` |

`PATCH /onboarding` **deep-merges** `crisisPlan` and `contact` rather than replacing them. The UI always sends complete sub-objects, so behaviour is identical to the mock while the server stops being lossy.

`completeOnboarding` must **validate that the required steps were actually filled** — the mock does not.

### Later slices — derived from the page-local storage modules, not invented

| Slice | Endpoints |
|---|---|
| Today | `POST /checkins` · `GET /checkins?from=&to=` · `GET /checkins/today` · `DELETE /checkins/{at}` |
| Talk | `GET /conversations` · `GET /conversations/{id}/messages` · `POST /conversations/{id}/messages` (streaming) · `DELETE /conversations/{id}` |
| Voice | `POST /stt` — self-hosted, audio never leaves controlled infrastructure |
| Trends | `GET /trends` · `GET /trends/insights` |
| Screening | `GET /screenings/due` · `POST /screenings/{instrument}/answers` · `GET /screenings/history` |
| Care | `GET /care/recommendation` · `POST /care/activities/{id}/complete` |
| Referral | `GET /referrals/slots` · `POST /referrals` · `GET /referrals/{id}/brief` · `POST /referrals/{id}/approve` |
| Counsellor | `GET /counsellor/queue` · `GET /counsellor/students/{id}/brief` · `GET /counsellor/caseload` |
| Institution | `GET /institutions/{id}/aggregate` — k-anonymity thresholded |

---

## 4 · Error contract

The mock has exactly one failure mode: `Error("mock: request failed")`. The UI surfaces it through `OnboardingError` — **"Something did not load. You can try again."** with a retry button.

The real client must keep that path working. Anything it throws lands in the same place, so:

- Network failure, 5xx and timeout → throw. The existing error state handles it.
- 401 → **do not throw.** Mint an anonymous account and retry once. Throw only if the retry also fails.
- 4xx other than 401 → throw with the server's message.

Backend errors are JSON with a stable shape (`type`, `title`, `detail`), logged server-side. **Log bodies are never written to logs** — no note text, no message text, no crisis-plan content.

---

## 5 · What the swap looks like

```
BEFORE                                AFTER

component                             component            (unchanged)
   │                                     │
   ▼                                     ▼
hooks.ts ── const api = mockClient    hooks.ts ── const api = httpClient
   │                                     │
   ▼                                     ▼
mockClient ──► localStorage           httpClient ──► fetch(credentials: "include")
                                                        │
                                                   Next rewrite  /api/v1/*
                                                        │
                                                     FastAPI ──► PostgreSQL
```

No component changes. `hooks.ts` switches on `NEXT_PUBLIC_API_URL`, so the mock remains a working offline fallback and the whole app still runs with the backend stopped.
