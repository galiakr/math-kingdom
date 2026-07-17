# Math Kingdom

Where numbers come alive and math is magical! Playful adventures that teach
real mathematical ideas to curious kids (8+), in English and Hebrew.

## Tech

- React 19 + TypeScript, built with Vite
- i18n with react-i18next — English / עברית, full RTL support
- Hash-based routing (works on GitHub Pages with no server config)
- Self-hosted fonts (Secular One, Rubik, IBM Plex Mono — all with Hebrew subsets)

## Develop

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

## Design

The kingdom is a **daylight quest map**: adventures are lands on an illustrated
map, connected by a winding path; your avatar stands where you left off, and
locked lands hide in the clouds. Progress is recorded in a **traveller journal**
(`/journal`) styled as a graph-paper notebook — visited lands become taped-in
stickers and ideas get checked off. Completion state lives in `localStorage`
(`src/progress.ts`).

**Each adventure owns its look and feel.** `<AdventureLayout>` accepts a
`theme` class and a `background` node, so an adventure can bring its own
palette, fonts, and backdrop (see `.theme-night` in `global.css` — the hotel's
starry world). New adventures add their own theme block instead of inheriting
the daylight kingdom.

## Project structure

Each math concept is a self-contained **adventure** under `src/adventures/`:

```
src/
├── adventures/
│   ├── index.ts             # registry: every concept, in display order
│   ├── types.ts             # Adventure / SceneDef / SkillDef interfaces
│   └── chord-factory/       # one folder per built adventure
│       ├── manifest.ts      # concept id + scenes (each may award a skill)
│       ├── index.ts         # metadata + lazy page + i18n bundle
│       ├── ChordFactory.tsx # the interactive page
│       ├── scenes/          # one component per scene
│       ├── ChordFactory.css
│       ├── en.json          # the adventure's own strings
│       └── he.json
├── engine/                  # useConceptFlow (scene arc, skill unlocks,
│                            #   completion) + useExerciseRunner (rounds
│                            #   with gentle retries)
├── audio/                   # useAudio() — the only door to Tone.js —
│                            #   and the shared MuteButton
├── components/              # shared UI (TopBar, AdventureLayout, …)
├── pages/                   # Home (the kingdom map) + Journal
├── i18n/                    # core strings + home-card copy; merges
│                            #   each adventure's bundle at startup
├── progress.ts              # completed adventures (localStorage)
├── skills.ts                # unlocked skills (localStorage)
└── main.tsx                 # routes generated from the registry
```

### Adding a new adventure

The full recipe lives in `.claude/skills/add-concept/SKILL.md`; in short:

1. Create `src/adventures/<name>/` with a `manifest.ts` (concept id +
   scenes/skills), the page component driven by `useConceptFlow`, its CSS,
   `en.json` + `he.json` (rooted at the adventure's own namespace), and an
   `index.ts` exporting an `Adventure` — use `chord-factory/` as the
   template (`hilbert-hotel/` is the minimal one). Wrap the page in
   `<AdventureLayout>` to get the background, top bar, back link, and hero
   for free.
2. Replace the adventure's placeholder entry in `src/adventures/index.ts`
   with the new import (set `status: 'available'` and a `path`).
3. Add or update the card copy under `home.adventures.<id>` in
   `src/i18n/en.json` and `he.json`.

Routes, translations, and the journal's skills display are wired
automatically from the registry, and each adventure's page is code-split so
it only loads when visited. Sound? Use `useAudio()` and follow
`.claude/skills/audio/SKILL.md` — never import Tone.js directly, and every
sound needs a visual parallel.

## Adventures

| Adventure | Concepts | Status |
| --- | --- | --- |
| Hilbert's Amazing Hotel | Infinity, set theory, logic | ✅ Playable |
| The Prime Number Orchestra (The Chord Factory) | Primes, number theory | ✅ Playable |
| The Fractal Pizza Palace | Fractals, self-similarity | ✅ Playable |
| The Probability Carnival | Probability, statistics | ✅ Playable |
| The Fibonacci Bunny Garden | Fibonacci, golden ratio | ✅ Playable |
| Topology Space Adventure | Topology, transformations | Coming soon |
| Graph Theory Kingdom | Graphs, networks | Coming soon |
| The Secret Math Mystery | ??? | Locked |
