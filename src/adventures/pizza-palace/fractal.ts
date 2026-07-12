export type Point = readonly [number, number];
export type Tri = readonly [Point, Point, Point];

/**
 * A slicing recipe: which of the four midpoint sub-triangles keep pizza,
 * in [top, left, right, middle] order.
 */
export type Rule = readonly [boolean, boolean, boolean, boolean];

/** The classic: keep the three corners, eat the middle. */
export const SIERPINSKI: Rule = [true, true, true, false];

/** The whole pie — an equilateral triangle filling the 100×87 viewBox. */
export const ROOT: Tri = [
  [50, 0],
  [0, 86.6],
  [100, 86.6],
];

const mid = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** The four midpoint sub-triangles: top, left, right, middle (upside-down). */
export function subdivide([a, b, c]: Tri): [Tri, Tri, Tri, Tri] {
  const ab = mid(a, b);
  const ac = mid(a, c);
  const bc = mid(b, c);
  return [
    [a, ab, ac],
    [ab, b, bc],
    [ac, bc, c],
    [ab, bc, ac],
  ];
}

export const survivors = (rule: Rule): number => rule.filter(Boolean).length;

/** All pieces after `depth` rounds of slicing with `rule`, as flat polygons. */
export function fractalAt(depth: number, rule: Rule = SIERPINSKI): Tri[] {
  let tris: Tri[] = [ROOT];
  for (let level = 0; level < depth; level++) {
    tris = tris.flatMap((tri) => subdivide(tri).filter((_, slot) => rule[slot]));
  }
  return tris;
}

export const pieceCount = (depth: number, rule: Rule = SIERPINSKI): number =>
  survivors(rule) ** depth;

/** Rendering stays kind to small devices: never draw more polygons than this. */
export const MAX_PIECES = 400;

/**
 * How deep a recipe may be baked: bounded by MAX_PIECES, and by 6 rounds —
 * beyond that the pieces are smaller than a pixel anyway.
 */
export function maxDepth(rule: Rule = SIERPINSKI): number {
  const s = survivors(rule);
  if (s <= 1) return 1;
  let depth = 0;
  while (depth < 6 && s ** (depth + 1) <= MAX_PIECES) depth++;
  return depth;
}
