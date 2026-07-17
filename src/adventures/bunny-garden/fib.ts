/** The sequence itself; index m-1 is the pair count in month m. */
export const FIB = [1, 1, 2, 3, 5, 8, 13, 21, 34];

export const LAST_MONTH = 6;

export interface Nest {
  id: number;
  bornMonth: number;
}

/**
 * Every nest that will ever exist in months 1–6, in birth order. The rabbit
 * rule (babies mature in a month; each adult pair makes one baby pair per
 * month) gives new-nest counts of 1, 0, 1, 1, 2, 3 — Fibonacci reborn.
 */
const ALL_NESTS: Nest[] = [1, 3, 4, 5, 5, 6, 6, 6].map((bornMonth, id) => ({
  id,
  bornMonth,
}));

export const nestsUpTo = (month: number): Nest[] =>
  ALL_NESTS.filter((nest) => nest.bornMonth <= month);

export const isBaby = (nest: Nest, month: number): boolean => nest.bornMonth === month;

export const pairsAt = (month: number): number => FIB[month - 1];

/**
 * The golden-spiral tiling of a 21×13 rectangle (×10 for clean strokes).
 * Verified: the squares tile 210×130 exactly, and with sweep=0 each
 * quarter-arc wraps the block before it — consecutive circles are
 * internally tangent (center_{k+1} = J + (r_{k+1}/r_k)(center_k − J) at
 * every junction J), so the curve spirals without inflections.
 */
export interface SpiralSquare {
  size: number;
  x: number;
  y: number;
  arc: string;
}

export const SPIRAL_SQUARES: SpiralSquare[] = [
  { size: 1, x: 50, y: 30, arc: 'M60 30 A10 10 0 0 0 50 40' },
  { size: 1, x: 50, y: 40, arc: 'M50 40 A10 10 0 0 0 60 50' },
  { size: 2, x: 60, y: 30, arc: 'M60 50 A20 20 0 0 0 80 30' },
  { size: 3, x: 50, y: 0, arc: 'M80 30 A30 30 0 0 0 50 0' },
  { size: 5, x: 0, y: 0, arc: 'M50 0 A50 50 0 0 0 0 50' },
  { size: 8, x: 0, y: 50, arc: 'M0 50 A80 80 0 0 0 80 130' },
  { size: 13, x: 80, y: 0, arc: 'M80 130 A130 130 0 0 0 210 0' },
];

/** Cycling square palette — theme tokens defined in .theme-garden. */
export const SQUARE_VARS = [
  'var(--petal)',
  'var(--mint)',
  'var(--marigold)',
  'var(--leaf)',
  'var(--sky-soft)',
];
