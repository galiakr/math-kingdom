export type SectorId = 'pink' | 'teal' | 'gold';

export interface WheelSector {
  id: SectorId;
  /** Relative slice size — the whole point of the adventure. */
  weight: number;
  colorVar: string;
  emoji: string;
}

/** The Great Wheel every scene refers back to: pink 5/8, teal 2/8, gold 1/8. */
export const CARNIVAL_WHEEL: WheelSector[] = [
  { id: 'pink', weight: 5, colorVar: 'var(--pink)', emoji: '👾' },
  { id: 'teal', weight: 2, colorVar: 'var(--teal)', emoji: '🐙' },
  { id: 'gold', weight: 1, colorVar: 'var(--gold)', emoji: '🦄' },
];

export const totalWeight = (sectors: WheelSector[]): number =>
  sectors.reduce((sum, s) => sum + s.weight, 0);

export const biggestSector = (sectors: WheelSector[]): WheelSector =>
  sectors.reduce((best, s) => (s.weight > best.weight ? s : best));

/** Weighted draw FIRST; the animation then honestly lands on it. */
export function drawSector(sectors: WheelSector[]): number {
  let r = Math.random() * totalWeight(sectors);
  for (let i = 0; i < sectors.length; i++) {
    r -= sectors[i].weight;
    if (r < 0) return i;
  }
  return sectors.length - 1;
}

/**
 * Cumulative forward rotation that brings sector `index` under the top
 * pointer: four drama turns plus the delta, with jitter so the wheel never
 * stops dead-center in a slice.
 */
export function rotationFor(sectors: WheelSector[], index: number, prev: number): number {
  const total = totalWeight(sectors);
  const start = (sectors.slice(0, index).reduce((s, x) => s + x.weight, 0) / total) * 360;
  const span = (sectors[index].weight / total) * 360;
  const jitter = (Math.random() - 0.5) * span * 0.7;
  const target = start + span / 2 + jitter; // deg clockwise from the pointer
  const current = ((prev % 360) + 360) % 360;
  const desired = (360 - target) % 360; // disc rotation that puts target on top
  return prev + 360 * 4 + ((desired - current + 360) % 360);
}

/** Point on the wheel rim, angle measured clockwise from 12 o'clock. */
export const polar = (deg: number, radius: number): [number, number] => {
  const rad = (deg * Math.PI) / 180;
  return [50 + radius * Math.sin(rad), 50 - radius * Math.cos(rad)];
};

/** SVG path for one pie slice of the 100×100 wheel disc. */
export function sectorPath(startDeg: number, endDeg: number, radius = 48): string {
  const [x1, y1] = polar(startDeg, radius);
  const [x2, y2] = polar(endDeg, radius);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M50,50 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
}
