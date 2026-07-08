# Math Kingdom

Playful math adventures for kids (8+), in English and Hebrew (full RTL).

- Each concept is a self-contained folder under `src/adventures/` — component,
  CSS, and its own `en.json`/`he.json` — registered in `src/adventures/index.ts`.
  Routes and i18n merge automatically from that registry.
- Concepts run on the engine (`src/engine/`): a `manifest.ts` declares scenes
  and the skills they award; `useConceptFlow` drives progression and
  completion; `useExerciseRunner` powers question rounds. Skill unlocks live
  in `src/skills.ts` and surface in the journal.
- All sound goes through `useAudio()` (`src/audio/`) — never import Tone.js
  directly, never autoplay, and every sound needs a visual parallel. See
  `.claude/skills/audio/SKILL.md`.
- The home page is a quest map (stations drawn from the registry); `/journal`
  is a notebook-styled progress page. Completion state: `src/progress.ts`.
- Each adventure owns its visual world: pass `theme` + `background` to
  `<AdventureLayout>` and define the theme's tokens in `global.css`
  (`.theme-night` is the hotel's). Don't force new adventures into the
  daylight palette.
- The step-by-step recipe for adding an adventure is in README.md
  ("Adding a new adventure"). Use `src/adventures/hilbert-hotel/` as the template
  and wrap pages in `<AdventureLayout>`.
- Every user-facing string must exist in both `en.json` and `he.json`.
- `npm run build` type-checks and builds; `npm run dev` for local work.
