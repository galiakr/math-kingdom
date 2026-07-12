import hilbertHotel from './hilbert-hotel';
import chordFactory from './chord-factory';
import pizzaPalace from './pizza-palace';
import type { Adventure } from './types';

export type { Adventure, AdventureStatus, SceneDef, SkillDef } from './types';

/**
 * Every concept in the kingdom, in home-page display order.
 *
 * To build a new adventure: create a folder next to hilbert-hotel/ with the
 * page component, its CSS, en.json + he.json, and an index.ts exporting an
 * Adventure — then replace the placeholder entry below with that import.
 * Card copy (title / description / tags) lives in src/i18n under
 * home.adventures.<id>.
 */
export const adventures: Adventure[] = [
  hilbertHotel,
  chordFactory,
  pizzaPalace,
  { id: 'probability', emoji: '🎪', glyph: '%', accent: '#ff7ab2', status: 'soon' },
  { id: 'fibonacci', emoji: '🐇', glyph: 'φ', accent: '#6fe0a8', status: 'soon' },
  { id: 'topology', emoji: '🚀', glyph: '≈', accent: '#5ac8fa', status: 'soon' },
  { id: 'graphs', emoji: '🏰', glyph: '∴', accent: '#4edcd2', status: 'soon' },
  { id: 'mystery', emoji: '❓', glyph: '?', accent: '#a9b2d9', status: 'locked' },
];
