export type AdventureStatus = 'available' | 'soon' | 'locked';

export interface Adventure {
  id: string;
  /** Playful companion icon shown on the badge chip. */
  emoji: string;
  /** Math glyph used as the card's watermark — each adventure's "field" symbol. */
  glyph: string;
  accent: string;
  status: AdventureStatus;
  path?: string;
}

export const adventures: Adventure[] = [
  { id: 'infinity', emoji: '🏨', glyph: '∞', accent: '#9d86ff', status: 'available', path: '/infinity' },
  { id: 'primes', emoji: '🎼', glyph: '7', accent: '#ffc94d', status: 'soon' },
  { id: 'fractal', emoji: '🍕', glyph: '∆', accent: '#ff8a5c', status: 'soon' },
  { id: 'probability', emoji: '🎪', glyph: '%', accent: '#ff7ab2', status: 'soon' },
  { id: 'fibonacci', emoji: '🐇', glyph: 'φ', accent: '#6fe0a8', status: 'soon' },
  { id: 'topology', emoji: '🚀', glyph: '≈', accent: '#5ac8fa', status: 'soon' },
  { id: 'graphs', emoji: '🏰', glyph: '∴', accent: '#4edcd2', status: 'soon' },
  { id: 'mystery', emoji: '❓', glyph: '?', accent: '#a9b2d9', status: 'locked' },
];
