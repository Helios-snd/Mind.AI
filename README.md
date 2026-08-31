# Mind.AI — marketing site (Next.js + Tailwind)

The marketing site and pre-onboarding flow for Mind.AI. **All imagery is greybox
placeholder** (`<Placeholder>`), to be swapped for real assets.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS 3
- `next/font` — Sora (display) + Nunito Sans (body)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## Pages

| Route | Notes |
|---|---|
| `/` | Landing page, all sections |
| `/depression` `/anxiety` `/adhd` | Driven by `src/data/services.ts` + `ServicePage` |
| `/tobacco-addiction` | Article shell — body copy is a TODO |
| `/counseling-vs-psychotherapy` | Article shell — body copy is a TODO |
| `/our-experts` | Demo doctor data |
| `/find-your-doctor` | 10-step matching questionnaire → experts list |
| `/volunteer` | Form |
| `/faq` | Questions listed; **answers are TODO** |
| `/careers` | Application form |
| `/contact-us` | Contact details + form |
| `/news` | Post titles only |
| `/all-resources` | Videos / blogs / assessments / music |
| `/privacy-policy` | **Confirm with legal** |
| `/terms-and-conditions` | Copy pending |
| `/login` | Placeholder auth screen |
| `/students-wellbeing` `/for-corporates` | Coming-soon stubs |

## Design tokens

- Brand: `#56663A` (deep olive), hover `#3F4A2B`
- Sage `#D9DCA8`, creams `#F5EBD7` / `#FCF8EE`
- Text: `ink` `#2F3325`, `earth` `#6B6250`, plus the Tailwind gray scale
- See `tailwind.config.ts` for the full palette

## TODO before launch

- Replace every `<Placeholder>` with real illustrations/photos/logo
- Fill FAQ answers (`src/data/faq.ts` + `Accordion`)
- Fill service-page FAQ answers and "Read More" content
- Add full article bodies for the two blog posts
- Publish Terms & Conditions copy
- Wire forms (volunteer, careers, contact, newsletter) to a backend
- Build `/login` auth, `/find-your-doctor` matching logic, assessments, music
- Add `sitemap.ts` / `robots.ts`, real metadata + OG images
