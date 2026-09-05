# 02 · Components and design tokens

---

## 1 · Design tokens — `tailwind.config.ts`

Exact values. These are the vocabulary; nothing new gets invented.

| Token | Hex | Purpose (from the config's own comments) |
|---|---|---|
| `brand.DEFAULT` | `#56663A` | deep olive — primary actions, links, active states |
| `brand.dark` | `#3F4A2B` | hover / pressed |
| `brand.light` | `#87945A` | muted sage — illustration fills, soft accents |
| `sage` | `#D9DCA8` | soft sage — section bands, large fills |
| `cream.DEFAULT` | `#F5EBD7` | warm cream — page ground, section bands |
| `cream.alt` | `#FCF8EE` | off-white — cards / content surfaces |
| `earth` | `#6B6250` | secondary text / muted accent |
| `ink` | `#2F3325` | darkest text / footer ground |
| `crisis.DEFAULT` | `#B23B2E` | high-contrast alert — SOS, form errors |
| `crisis.dark` | `#8F2C21` | — |

Also: `fontFamily.sans → var(--font-body)`, `fontFamily.display → var(--font-display)`, `maxWidth.container: 1200px`, `boxShadow.card` / `.soft` / `.pill` (pill uses the crisis-red glow `rgba(178,59,46,0.4)`), `keyframes["fade-up"]` (opacity 0 + `translateY(6px)` → 0) with `animation["fade-up"]: "fade-up 0.35s ease-out both"`. **`plugins: []`** — no typography plugin.

### Fonts — `src/app/layout.tsx:6-19`
`Sora` (400/500/600/700) → `--font-display`; `Nunito_Sans` (400/600/700) → `--font-body`, `adjustFontFallback: false`. Both on `<html>`; body is `flex min-h-screen flex-col font-sans`.

### `globals.css`

The only custom property block is `:root { color-scheme: light; }` (`:5-7`). Font vars come from `next/font`, not CSS.

`@layer components` (`:13-39`):

| Class | Definition |
|---|---|
| `.container-x` | `mx-auto w-full max-w-container px-5 sm:px-8` |
| `.btn-primary` | `rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark` |
| `.btn-outline` | `rounded-xl border border-brand px-6 py-3 … hover:bg-brand hover:text-white` |
| `.h-display` | `font-display font-bold tracking-tight text-gray-900` |
| `.card` | `rounded-2xl border border-ink/[0.06] bg-cream-alt shadow-soft` |
| `.field` | app input style, `focus:ring-4 focus:ring-brand/10` |

Outside the layer: `.slider` + webkit/moz thumb rules (`:42-75`, thumb `#56663a` on `#fcf8ee`), and `.placeholder-box` (`:78-91`) — a 28px diagonal-stripe greybox on `#ede7d6`.

### Two colour vocabularies — a known inconsistency

Marketing pages use raw Tailwind greys (`text-gray-900`, `text-gray-600`, `border-gray-200`, `bg-white`). The `(app)` screens use the brand tokens (`ink`, `earth`, `cream-alt`). **Three app routes sit on the wrong side of this line**: `/data`, `/human`, `/me/delete` use `gray-*`.

**Dead class:** `privacy-policy:12` applies `prose-mindai`, which is defined nowhere and has no typography plugin behind it. It is a no-op.

**Hex duplication:** `art.tsx:7-12` re-declares the palette as local constants. `LAV = "#8C8A6E"` does **not** match `earth: #6B6250`, though the file comment on `:4` calls it "earth". `TrendChart.tsx:7-13` likewise hardcodes `BRAND = "#56663A"`, `AXIS = "#9c9484"`, and `"#FCF8EE"` at `:149`/`:159`. `SleepSlider.tsx:51` hardcodes `#56663A` in an inline gradient.

---

## 2 · Shared components — `src/components/`

| File | Exports | Props | Renders |
|---|---|---|---|
| `Shell.tsx` | default `Shell` | `{ children }` | `HelpNowGateProvider` → `<main flex-1>` + `HelpNowLauncher` + conditional `TabDock`. `"use client"` |
| `Header.tsx` | default `Header` | — | Sticky `bg-cream-alt/90 backdrop-blur`, `h-[72px]`. **Dropdown triggers have no `onClick`/`aria-expanded`/`aria-haspopup`** |
| `AppHeader.tsx` | named `AppHeader` | `{ title: string; subtitle?: string }` | `<header className="animate-fade-up">`, `text-[26px]` display h1 + `text-earth` subtitle. Server component |
| `Footer.tsx` | default `Footer` | — | `mt-24 bg-ink text-gray-300`, 4-col grid, newsletter, legal bar, `pb-28` |
| `Section.tsx` | `Section`, `SectionHeading` | `Section {children, className?, id?}` · `SectionHeading {eyebrow?, title, subtitle?, center? = true}` | `<section py-12 sm:py-16>` wrapping `.container-x` |
| `Accordion.tsx` | default `Accordion`, type `AccordionItem = {q, a?}` | `{ items }` | Single-open, `+`/`–`, `aria-expanded`. **Missing `a` → italic "Answer copy to be added from the Mind.AI content team." (`:28`)** — fires on all 14 FAQ + 15 service FAQs = **29 empty answers** |
| `ServicePage.tsx` | default | `{ data: ServiceContent }` | 5 sections: hero, types grid, signs 4-col, brand CTA, FAQ accordion |
| `ArticleLayout.tsx` | default | `{ category, date?, title, intro, outline: string[] }` | Header + `TopicThumb` + intro, then a dashed box: **"Full article body to be added by the Mind.AI content team." (`:35`)** |
| `ComingSoonPage.tsx` | default | `{ title, blurb }` | h1 + blurb + `CalmScene` + **"This page exists in the live navigation but its content was not part of this build pass." (`:21`)** |
| `Placeholder.tsx` | default | `{ label, className?, ratio? = "aspect-video", rounded? = "rounded-xl" }` | `.placeholder-box`, `role="img"`. **Dead code — zero imports** |
| `Dock.tsx` | `Dock` (forwardRef), `DockIcon`, `DockProps`, `DockIconProps` | `{className?, children, iconSize? = 52, iconMagnification? = 74, iconDistance? = 140, disableMagnification? = false, direction? = "bottom"}` | MagicUI-adapted macOS dock. `useMotionValue` → `useTransform` → `useSpring({mass:0.1, stiffness:150, damping:12})` |
| `TabDock.tsx` | default | — | Fixed bottom `<nav>` with `env(safe-area-inset-bottom)`. 4 tabs: `/today` `/talk` `/trends` `/me`; `/me/*` keeps Me active; `/data` and `/human` highlight nothing |
| `formFields.tsx` | `fieldErrorId`, `phoneLooksValid`, `TextArea`, `TextField` | `TextArea {id,label,placeholder?,value,onChange,error?}` · `TextField {id,label,value,onChange,error?,type? = "text",inputMode?: "tel"}` | `.field` inputs with `aria-invalid` / `aria-describedby`, `text-crisis` errors |
| `icons.tsx` | `TodayIcon`, `TalkIcon`, `TrendsIcon`, `MeIcon` | `{ className? }` | 24×24, `currentColor`, strokeWidth 1.6. Used **only** by `TabDock` |
| `art.tsx` | `MeditationScene`, `MatchScene`, `CareScene`, `CalmScene`, `ConditionGlyph`, `FeatureGlyph`, `LineIcon`, `TopicThumb`, `Avatar` | see below | All original inline SVG. `TopicThumb`/`Avatar` derive colour + rotation from `hash()`; `Avatar` strips a leading `Dr.` and takes 2 initials |

`ConditionGlyph {kind: "depression"|"anxiety"|"adhd"}` · `FeatureGlyph {kind: "diagnosis"|"therapy"|"holistic"}` · `LineIcon {name}` where names are `therapy`, `progress`, `community`, `book`, `music`, `video`, `clipboard`, `leaf` — **only 4 are used**; `book`, `music`, `video`, `leaf` are dead.

### The validator that must not be duplicated

```ts
// src/components/formFields.tsx
export function phoneLooksValid(raw: string) {
  return /^(\+?91)?\d{10}$/.test(raw.replace(/[\s-]/g, ""));
}
```

India-only, strips spaces and hyphens. **The backend mirrors this rule; it does not invent a second one.**

---

## 3 · i18n — `src/i18n/`

- **Locale source:** not a URL segment, not a cookie, not `navigator.language`. `index.ts:41` reads `useOnboardingProgress().data?.language ?? "en"` — i.e. from React Query, backed by the API client. **Changing language is a mutation, not a local toggle.**
- **API:** `I18nProvider`, `useI18n() → { language, setLanguage, isSaving, t, n }`, `useT()`, `useLanguage()`.
- `t(key, vars)` interpolates `{name}` via `/\{(\w+)\}/g` (`:32`). `n(value)` uses `Intl.NumberFormat("bn-BD" | "en-IN")` so counts render in Bengali digits.
- Mounted globally at `providers.tsx:26`, so it wraps the marketing site too.

**Coverage: `en.ts` and `bn.ts` both have exactly 215 keys, at perfect parity.** `bn.ts` ends with `satisfies Record<Keys, string>`, so **a missing Bengali key is a compile error**. Register is informal তুমি.

Namespaces: `action.*` `state.*` `onboarding.*` `help.*` `nav.*` `talk.*` `today.*` `trends.*` `data.*` `me.*` `human.*`.

**Gap: the entire marketing site is untranslated.** Every string on `/`, the service pages, header, footer and nav labels is hardcoded English JSX.

---

## 4 · Data files — `src/data/` and `src/content/`

| File | Export | Shape | Count |
|---|---|---|---|
| `nav.ts` | `primaryNav` | `NavGroup[] = {label, items: NavLink[], href?}` | 3 groups / 12 links. **`href?` is never set and never read** |
| | `standaloneNav` | `NavLink[] = {label, href}` | 1 |
| | `footerNav` | `NavGroup[]` | 3 groups / 10 links |
| `services.ts` | `services` | `Record<string, ServiceContent>` | 3 keys — depression 3 types/4 signs/5 faqs · anxiety 6/4/5 · adhd 4/4/5 |
| `experts.ts` | `experts` | `{name, experience, price, expertise, speaks, nextSlot}` | **5**, marked `// Demo data`. All `"Starts @ ₹1200 per session"`; slots are May dates with no year |
| `faq.ts` | `faqCategories` | `{category, questions: string[]}` | **4 categories, 14 questions, 0 answers.** `// Answers are pending.` |
| `therapistMatch.ts` | `matchQuestions` | `{q, options: string[]}` | **10 questions, 43 options.** `// Answers are collected client-side only; no scoring/matching is wired yet.` |
| `content/instruments.ts` | `DASS21`, `DASS21_TOTAL` | `Dass21Item = {id, en, bn}` | **3 of 21 items** — `dass-3`, `dass-5`, `dass-10`, all Depression subscale |

### DASS-21 — read this before touching it

**Updated in slice A.** All 21 published items are now present, and scoring
exists server-side in `backend/app/modules/screening/`.

- Public domain (Lovibond & Lovibond, 1995); the English wording is the
  published item text, used as-is.
- Item ids match the published numbering. **Do not renumber them** — the
  subscale mapping in `screening/scoring.py` keys off the number.
- Response frame stays `0..3`. Labels: Never / Sometimes / Often / Almost always.

Subscale allocation and cut-offs live in `screening/scoring.py`, verified by
`tests/test_scoring.py` against the published boundaries:

```
Depression  3, 5, 10, 13, 16, 17, 21
Anxiety     2, 4, 7, 9, 15, 19, 20
Stress      1, 6, 8, 11, 12, 14, 18

raw = sum(subscale items) × 2      (DASS-42 comparability)
```

Scores are written to `screening_sessions` / `screening_scores` at onboarding
completion. **They are never returned to the student** — hard constraint 1,
enforced by `tests/test_onboarding.py::test_scores_are_never_exposed_to_the_student`.

#### Outstanding debt: the Bengali translation is not validated

`BANGLA_DASS21_VALIDATED = false` in `src/content/instruments.ts`, mirrored by
`VALIDATED_LANGUAGES` in `screening/service.py`. Every scoring run carries
`screening_sessions.instrument_validated`, which is **false for any `bn` run**.

The Bengali strings are working translations written for development. They have
no psychometric validation, so a score derived from them is **not a clinical
result** and must not be presented as one — in a counsellor brief or anywhere
else. Clearing this debt means replacing the `bn` strings with a published,
validated Bangla DASS-21 and flipping both flags together. Improving the
wording is not the same thing as validating the instrument.

This also bears on open question 2 in `08-safety-and-privacy.md` §8: PHQ-9 in
Bengali is not PHQ-9 in English, and somatic idioms of distress complicate
scoring.
