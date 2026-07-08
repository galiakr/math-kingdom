---
name: rtl
description: Hebrew/RTL rules for Math Kingdom UI — what flips, what stays LTR (number pads, beat grids, sequences), and how to verify both directions.
---

# RTL in Math Kingdom

The app is fully bilingual (en/he); `dir=rtl` is set on `<html>` when the
language is Hebrew. Layout chrome, labels, instructions, and reading order
flip automatically — prefer logical CSS properties (`margin-inline`,
`padding-inline`, `inset-inline-start`) so this stays free.

## Number sequences stay left-to-right

Number sequences read LTR **even in Hebrew text**. Any UI where spatial order
encodes numeric order must not mirror:

- number pads (2, 3, 4, … must run left→right)
- beat grids / sequencer timelines (beat 1 on the left)
- number lines, room-number rows, counting animations

Force these containers with `direction: ltr` in the adventure's CSS. The
labels *around* them (headings, hints, buttons) still flip as usual.

## Every string in both languages

Any user-facing string must exist in both `en.json` and `he.json` (core or
the adventure's own bundle). Hebrew copy uses the same playful register as
the English — translate the spirit, not the words.

## Verifying

Drive `/?lang=he#/...` (reload after changing the query — it's read once at
startup) and check: `html[dir=rtl]`, chrome mirrored, but number pads/grids
still LTR. Toggle `.lang-btn` mid-page and re-check both directions.
