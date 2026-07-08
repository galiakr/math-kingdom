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

- Home (quest map): `/#/` — 8 `.station` elements on the map, avatar
  (`.station-avatar`) on the first open land, `.signpost-count` shows progress.
- Adventure: click `.station-available` → `.hotel-sign` appears (lazy route);
  the hotel page keeps its `.theme-night` class.
- Play: "Start the story" → `.waiting-dialogue`; "Show the magic!" →
  `.celebration` (animation takes ~5s; use a generous timeout). Finishing all
  three scenarios → `.finished-overlay` and marks the adventure completed
  (localStorage `math-kingdom-progress`).
- Journal: `/#/journal` — completed adventures show `.sticker` (taped),
  others `.sticker-empty`; checked ideas: `.journal-checklist li.is-checked`.
- Deep link: `goto('/#/infinity')` + reload — lazy route must load cold.
- Hebrew: `goto('/?lang=he#/')` + reload — `html[dir=rtl]`, map path and
  stations mirror; toggle `.lang-btn` mid-page and re-check.
- Mobile: 390px viewport → `.map-tall` variant with vertical winding path.

## Gotchas

- `?lang=` is read once at startup — after `goto` with a new query, `reload()`.
- Unknown hash routes render an empty body (no catch-all route) — expected.
