# Mind.AI — site rebuild (Next.js + Tailwind)

A framework rebuild of the marketing site at [mind.ai](https://www.mind.ai/), whose
live version is a Create React App SPA. Content and layout were reconstructed from
the rendered pages; **all imagery is greybox placeholder** (`<Placeholder>`), to be
swapped for real assets.

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

## Pages built

| Route | Source page | Notes |
|---|---|---|
| `/` | `/` | Full landing page, all sections |
| `/depression` `/anxiety` `/adhd` | same | Driven by `src/data/services.ts` + `ServicePage` |
| `/tobacco-addiction` | same | Article shell — body copy is a TODO |
| `/counseling-vs-psychotherapy` | same | Article shell — body copy is a TODO |
| `/our-experts` | `/Ourexperts` | Demo doctor data |
| `/find-your-doctor` | same | 10-step quiz shell; only Q1 wording is real |
| `/volunteer` | same | Form |
| `/faq` | same | Questions captured; **answers are TODO** |
| `/careers` | `/Careers` | Full application form |
| `/contact-us` | same | Contact details + form |
| `/news` | same | Post titles only |
| `/all-resources` | same | Videos / blogs / assessments / music |
| `/privacy-policy` | same | Condensed from live text — confirm with legal |
| `/terms-and-conditions` | same | Empty on live site |
| `/login` | `/login` | Placeholder auth screen (was out of scope) |
| `/students-wellbeing` `/for-corporates` | Services menu | Coming-soon stubs (not captured) |

## Route changes from the original

Slugs normalized to kebab-case: `/Ourexperts` → `/our-experts`,
`/Careers` → `/careers`. The live "About Us" link points to `/faq` (no dedicated
About page exists) — preserved.

## Design tokens (sampled from the live build)

- Brand: `#F0703A` (hover `#CC6235`)
- Creams: `#FFF5EA`, `#FFF7E9`
- Text: Tailwind gray scale (900/800/700/600/500)

## TODO before launch

- Replace every `<Placeholder>` with real illustrations/photos/logo
- Fill FAQ answers (`src/data/faq.ts` + `Accordion`)
- Fill service-page FAQ answers and "Read More" content
- Add full article bodies for the two blog posts
- Publish Terms & Conditions copy
- Wire forms (volunteer, careers, contact, newsletter) to a backend
- Build `/login` auth, `/find-your-doctor` real questions, assessments, music
- Add `sitemap.ts` / `robots.ts`, real metadata + OG images
