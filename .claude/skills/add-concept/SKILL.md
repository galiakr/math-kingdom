---
name: add-concept
description: The recipe for adding a new math concept (adventure) on the engine — manifest, scenes, skills, i18n, theme, and registry wiring.
---

# Adding a concept to Math Kingdom

Each concept is a self-contained folder under `src/adventures/<name>/`,
born on the engine (`src/engine/`). Use `chord-factory/` as the template
(`hilbert-hotel/` is the minimal one).

## Files

```
src/adventures/<name>/
├── manifest.ts     # CONCEPT_ID + scenes: SceneDef[] (each scene may award a skill)
├── index.ts        # Adventure entry: metadata, lazy Page, i18n bundle, scenes
├── <Name>.tsx      # page: useConceptFlow({ conceptId, scenes }) + scene switch
├── scenes/         # one component per scene (larger concepts)
├── <Name>.css      # the adventure's own styles
├── en.json         # strings rooted at the concept's namespace
└── he.json
```

The manifest lives in its own file so the page component can import it
without touching `index.ts` (which lazily imports the page back).

## The engine contract

- `useConceptFlow({ conceptId, scenes })` drives the arc. A scene calls
  `flow.completeScene()` the moment its learning goal is met — this unlocks
  the scene's skill. Navigation stays free: the "next" button is always
  enabled (kids are never locked out); use `flow.sceneDone` for celebration
  cues, not gating. `flow.advance()` from the last scene records
  completion; render the finished overlay off `flow.finished`.
- Skills: declare in the manifest as `{ id: '<concept>-<skill>', titleKey:
  '<ns>.skills.<key>' }` with names in both JSON bundles. The journal picks
  them up automatically.
- Exercises: build question rounds on `useExerciseRunner(rounds, check)` —
  unlimited gentle retries, `attempts` for escalating hints, `submit`/`next`
  split so you can celebrate between rounds.

## Wiring

1. Replace the concept's placeholder entry in `src/adventures/index.ts`
   (set `status: 'available'`, `path`, `Page`, `i18n`, `scenes`, `moments`).
2. Card copy under `home.adventures.<id>` in `src/i18n/{en,he}.json`
   usually already exists for planned concepts.
3. Own visual world: pass `theme` + `background` to `<AdventureLayout>` and
   add the theme's tokens in `global.css` — don't inherit another
   adventure's palette.
4. Sound? Follow the audio skill. Hebrew? Follow the rtl skill.
5. Update the README adventures table, then `npm run build` and verify with
   the verify skill.
