---
name: audio
description: Rules for any sound in Math Kingdom — the useAudio() hook, gesture-gated start, visual parallels, volume limits, and how to test audio features.
---

# Audio in Math Kingdom

All sound goes through `useAudio()` from `src/audio/` — **never import Tone.js
directly** in a scene or adventure (same principle as scenes never calling an
API directly). The hook wraps a shared Tone graph: PolySynth for chords plus
drum/shaker/bell/trumpet voices for orchestral scenes.

## Non-negotiable: sound is never the only channel

Every sound must have a visual parallel a deaf or hard-of-hearing child can
learn from alone. A chord renders as stacked colored blocks (12 shows
teal-teal-purple); a beat pulses its grid cell; a "listen" moment highlights
what is playing. If you add a sound, add its visual in the same commit.

## Never autoplay

Browsers block audio until a user gesture, and kids should choose when sound
starts. `audio.start()` must be called inside a click handler — adventures
open with a big "turn on" button that doubles as a fun moment. Every `play*`
call is a silent no-op until then, so unconditional calls are safe.

## Volume discipline (children's ears)

The master chain caps gain (-9 dB volume + limiter) and every voice uses
gentle attack/release envelopes — this lives in `useAudio.ts`; don't bypass
it or add voices routed straight to the destination. Adventures with sound
render `<MuteButton>` (persistent mute, localStorage) near the top of the
page.

## Testing audio features

- Unit (Vitest): stub the hook — `vi.mock('src/audio', ...)` returning no-op
  `play*` fns and `ready: true`; assert on calls, never on actual sound.
- Browser (Playwright / the verify skill): assert on the visual parallels
  (chord blocks, pulsing cells), not on audio. Headless Chromium runs with
  no audible output; `audio.start()` still resolves after a synthetic click.
