---
name: verify
description: Build, launch, and drive Math Kingdom headlessly to verify changes at the browser surface.
---

# Verifying Math Kingdom

Client-side Vite + React SPA with hash routing. The surface is a browser —
verify by driving pages, not by curling (curl only returns the empty shell).

## Build and serve

```bash
npm run build                             # tsc + vite build into dist/
npm run preview -- --port 4173 --strictPort   # serve dist/ (background)
```

## Drive headlessly

No Playwright in the repo, but a Playwright Chromium is cached at
`~/Library/Caches/ms-playwright/chromium-*/chrome-mac-x64/**/Chromium`.
In a scratch dir: `npm i playwright-core`, then launch with
`chromium.launch({ executablePath })` pointed at that binary.
Collect `pageerror` and console `error` events — the app should produce none.

## Flows worth driving

- Home: `/#/` — 8 `.card` elements, one enabled `.card-cta`.
- Adventure: click the enabled CTA → `.hotel-sign` appears (lazy route).
- Play: "Start the story" → `.waiting-dialogue`; "Show the magic!" →
  `.celebration` (animation takes ~5s; use a generous timeout).
- Back link: `.back-link` returns to `.kingdom-grid`.
- Deep link: `goto('/#/infinity')` + reload — lazy route must load cold.
- Hebrew: `goto('/?lang=he#/infinity')` + reload — `html[dir=rtl]`,
  translated `.hero-title`; toggle `.lang-btn` mid-page and re-check.

## Gotchas

- `?lang=` is read once at startup — after `goto` with a new query, `reload()`.
- Unknown hash routes render an empty body (no catch-all route) — expected.
