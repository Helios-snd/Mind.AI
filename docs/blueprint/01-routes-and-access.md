# 01 · Routes, navigation and access control

27 routes across two route groups plus a global 404. Both groups share `src/app/layout.tsx`.

---

## 1 · Public layer — `src/app/(marketing)/`

Layout: `Header` → `<main>` → `Footer` → `HelpNowLauncher` → `TabDock`.

**Access: open to everyone. No account, no onboarding, nothing minted by browsing.**

| URL | File | Kind |
|---|---|---|
| `/` | `page.tsx` (384) | Real — 10 hand-built sections |
| `/find-your-doctor` | `find-your-doctor/page.tsx` (116) | Real — 10-step quiz. **Answers discarded on unmount; no scoring** |
| `/depression` | `depression/page.tsx` (9) | `ServicePage` instance — `services.depression` |
| `/anxiety` | `anxiety/page.tsx` (9) | `ServicePage` instance — `services.anxiety` |
| `/adhd` | `adhd/page.tsx` (9) | `ServicePage` instance — `services.adhd` |
| `/tobacco-addiction` | (22) | `ArticleLayout` — intro + outline, **no body** |
| `/counseling-vs-psychotherapy` | (21) | `ArticleLayout` — intro + outline, **no body** |
| `/for-corporates` | (13) | **`ComingSoonPage` stub** |
| `/students-wellbeing` | (13) | **`ComingSoonPage` stub** |
| `/privacy-policy` | (172) | Real — full legal copy, "Last updated: October 06, 2024" |
| `/terms-and-conditions` | (18) | **Stub** — heading + one italic line |
| `/faq` | (26) | Shell only — **14 questions, 0 answers** |
| `/all-resources` | (131) | Real — 4 anchored sections, mock content |
| `/careers` | (159) | Real — large **non-submitting** form |
| `/our-experts` | (54) | Real, over 5 demo records |
| `/news` | (39) | **Near-stub** — 3 title strings, no bodies |
| `/volunteer` | (65) | Real — **non-submitting** form |
| `/contact-us` | (82) | Real — **non-submitting** form |
| `/login` | (48) | **Stub** — `// Placeholder auth screen — not yet wired to a backend.` (`:7`) |

**Stub inventory:** `/for-corporates`, `/students-wellbeing`, `/terms-and-conditions`, `/login`, plus content-empty `/faq`, `/news`, `/tobacco-addiction`, `/counseling-vs-psychotherapy`.

**All five marketing forms have no `onSubmit`, no `action`, no `preventDefault`:** newsletter (`Footer.tsx:32`), contact (`contact-us:47`), volunteer (`volunteer:15`), careers (`careers:73`, plus two **fake `<div>` upload widgets** that are not `<input type="file">`), login (`login:16`).

---

## 2 · Gated layer — `src/app/(app)/`

Layout: `<Shell>` only. **No marketing `Header`, no `Footer`.**

| URL | File | Access | Guard today |
|---|---|---|---|
| `/onboarding` | `onboarding/page.tsx` → `OnboardingRoute` | Account required | Redirects to `/today` if `completedAt` |
| `/today` | `today/page.tsx` | Account + onboarded | Soft guard `:33` |
| `/talk` | `talk/page.tsx` | Account + onboarded | Soft guard `:40` |
| `/trends` | `trends/page.tsx` | Account + onboarded | Soft guard `:28` |
| `/me` | `me/page.tsx` | Account + onboarded | Soft guard `:32` |
| `/me/delete` | `me/delete/page.tsx` | Account + onboarded | **None** |
| `/data` | `data/page.tsx` | Account + onboarded | **None** |
| `/human` | `human/page.tsx` | Account + onboarded | **None** |

The "soft guard" is this, duplicated four times:

```ts
if (progress.data && !progress.data.completedAt) router.replace("/onboarding");
```

`docs/frontend-todo.md` already flags this: *"Guard + 'returning' logic should move to the shell for cross-tab consistency."*

### Global

`src/app/not-found.tsx` — renders outside **both** groups, so the 404 has no header, footer or dock.

---

## 3 · Target access model

```
  request /talk
      │
      ▼
  session cookie present?
      │
   ┌──┴──┐
  NO    YES
   │     │
   │     ▼
   │   onboarding completed?
   │     │
   │  ┌──┴──┐
   │ NO    YES
   │  │     │
   ▼  ▼     ▼
 /onboarding   render /talk
```

**Public routes never trigger this.** A visitor can read the entire marketing site without an account existing.

Enforcement is split deliberately:

- **`middleware.ts`** reads the session cookie and redirects. This is **UX only** — it prevents a flash of gated content and keeps the gate in one file. It does not trust the cookie's contents.
- **The API** verifies the JWT signature and the database state on every single request. This is the actual authorization boundary.

A middleware-only gate would look protected and not be.

---

## 4 · Navigation — `src/data/nav.ts`

### `primaryNav` — 3 hover dropdowns, 12 links

| Group | Items |
|---|---|
| **About Us** | Home `/` · FAQs `/faq` · Careers `/careers` · Contact Us `/contact-us` |
| **Services** | Depression `/depression` · Anxiety `/anxiety` · ADHD `/adhd` · Students Well-being Programme `/students-wellbeing` · For Corporates `/for-corporates` |
| **Resources** | All Resources `/all-resources` · Blogs `#blogs` · Music `#music` · Videos `#videos` · Assessment `#assessment` |

All four anchors resolve to real `<Section id>` values in `all-resources/page.tsx`.

### `standaloneNav`
Our Experts → `/our-experts`

### `footerNav` — 3 columns; `Footer.tsx` renders a 4th inline

| Column | Items |
|---|---|
| **About Mind.AI** | About Us → **`/faq`** · Careers · Contact Us · FAQs → `/faq` |
| **Offerings** | Diagnosis and Therapy · Self-care and Progress · Community — **all three → `/#offerings`** |
| **Services** | Depression · Anxiety · ADHD |
| **Newsletter** | Hardcoded in `Footer.tsx:29-42`, no `onSubmit` |

### Constants
`EMERGENCY_HELPLINE = "1-800 891 4416"` · `CONTACT_EMAIL = "contact@mind.ai"` (`nav.ts:70-71`)

### Header CTAs — hardcoded, not in `nav.ts`
`Header.tsx:66-80` — "Get started" → `/onboarding` · "Login" → `/login` · a ♥ circle button → `/volunteer`. The mobile menu repeats nav + both CTAs but **omits the ♥ link**.

---

## 5 · Chrome matrix

| Component | Mounted at | What it is |
|---|---|---|
| `Header` | `(marketing)/layout.tsx:14` only | Sticky 72px bar, 🪷 logo, CSS-hover dropdowns, 3 CTAs |
| `Footer` | `(marketing)/layout.tsx:16` only | `bg-ink` 4-column footer; `pb-28` clears the dock |
| `AppHeader` | Imported by `/today`, `/trends`, `/me` only | Not a bar — a title/subtitle text block. `/talk` uses its own sticky header |
| `TabDock` | `(marketing)/layout.tsx:22` **and** `Shell.tsx:32` | Fixed bottom tab bar |
| `Dock` | `TabDock.tsx:7` only | Low-level magnifying container primitive |
| `HelpNowLauncher` | Both layouts, in **separate** `HelpNowGateProvider` instances | Crisis pill |

`Shell.tsx:26` hides the dock on exactly one route: `pathname !== "/onboarding"`.

### Dead and misleading links

1. `footerNav` "About Us" → `/faq` — there is no About page, and the same column also links "FAQs" → `/faq`.
2. All three "Offerings" links → the identical `/#offerings` anchor.
3. `all-resources:17` — a blog card linking to `/all-resources#blogs`, i.e. **back to itself**.
4. Homepage `:73` — "SHORTS / Improve Mental Health Instantly" → `/all-resources#videos`, not to any video.
5. Three "start" destinations: `/onboarding` (Header), `/find-your-doctor` (`login:41` and homepage secondary).
6. `find-your-doctor:96-104` promises a match, then links to `/our-experts`, which shows the same 5 unfiltered demo doctors regardless.
7. Contact drift: `contact@mind.ai` (nav constant) vs `privacy@mind.ai` (`privacy-policy:149`) vs a hardcoded copy in `contact-us:29` that ignores the constant.
8. Helpline mismatch: `tel:18008914416` (`find-your-doctor:109`) vs **Tele-MANAS `tel:14416`** (`HelpNowSheet:119`, `human:24`).

### Non-functional controls

"Read More →" on every `ServicePage` type card and every news card · "View All Videos / Blogs / Assessments" · "Take Test" ×3 · "Book Appointment" ×5 · both careers `Upload` widgets.
