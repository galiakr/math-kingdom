export interface GraphNode {
  id: string;
  x: number;
  y: number;
  emoji?: string;
}

export interface GraphEdge {
  a: string;
  b: string;
  /**
   * Signed perpendicular offset (viewBox units) for the quadratic control
   * point — parallel bridges between the same two castles get opposite signs.
   */
  curve?: number;
}

export interface GraphDef {
  id: string;
  viewBox: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const degree = (g: GraphDef, nodeId: string): number =>
  g.edges.filter((e) => e.a === nodeId || e.b === nodeId).length;

export const oddNodes = (g: GraphDef): string[] =>
  g.nodes.filter((n) => degree(g, n.id) % 2 === 1).map((n) => n.id);

export const nodeById = (g: GraphDef, id: string): GraphNode =>
  g.nodes.find((n) => n.id === id)!;

/** SVG path for an edge: straight line, or a quadratic bowed by `curve`. */
export function edgePath(g: GraphDef, e: GraphEdge): string {
  const a = nodeById(g, e.a);
  const b = nodeById(g, e.b);
  if (!e.curve) return `M${a.x},${a.y} L${b.x},${b.y}`;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 + (e.curve * -dy) / len;
  const cy = (a.y + b.y) / 2 + (e.curve * dx) / len;
  return `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`;
}

/* ---------- scene 1: the kingdom map ---------- */

export const MAP_GRAPH: GraphDef = {
  id: 'map',
  viewBox: '0 0 340 240',
  nodes: [
    { id: 'A', x: 60, y: 70, emoji: '🏰' },
    { id: 'B', x: 180, y: 40, emoji: '🏯' },
    { id: 'C', x: 300, y: 80, emoji: '🏰' },
    { id: 'D', x: 110, y: 195, emoji: '🏰' },
    { id: 'E', x: 255, y: 195, emoji: '🏰' },
  ],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'A', b: 'D' },
    { a: 'D', b: 'E' },
    { a: 'E', b: 'C' },
    { a: 'B', b: 'E' },
  ],
};

/* ---------- scene 2: ramping Euler-path patrols ---------- */

/** All even degrees — a circuit; any starting castle works. */
export const T1: GraphDef = {
  id: 't1',
  viewBox: '0 0 300 220',
  nodes: [
    { id: 'A', x: 150, y: 40, emoji: '🏰' },
    { id: 'B', x: 50, y: 180, emoji: '🏰' },
    { id: 'C', x: 250, y: 180, emoji: '🏰' },
  ],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'C', b: 'A' },
  ],
};

/** Odd castles: C and D — the walk must start (and end) at one of them. */
export const T2: GraphDef = {
  id: 't2',
  viewBox: '0 0 340 220',
  nodes: [
    { id: 'A', x: 90, y: 50, emoji: '🏰' },
    { id: 'B', x: 40, y: 180, emoji: '🏰' },
    { id: 'C', x: 195, y: 150, emoji: '🏰' },
    { id: 'D', x: 300, y: 60, emoji: '🗼' },
  ],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'A', b: 'C' },
    { a: 'C', b: 'D' },
  ],
};

/** The classic open envelope: odd castles are the two bottom corners. */
export const T3: GraphDef = {
  id: 't3',
  viewBox: '0 0 300 240',
  nodes: [
    { id: 'L', x: 60, y: 205, emoji: '🏰' },
    { id: 'R', x: 240, y: 205, emoji: '🏰' },
    { id: 'TL', x: 60, y: 95, emoji: '🏰' },
    { id: 'TR', x: 240, y: 95, emoji: '🏰' },
    { id: 'P', x: 150, y: 25, emoji: '🗼' },
  ],
  edges: [
    { a: 'L', b: 'R' },
    { a: 'L', b: 'TL' },
    { a: 'R', b: 'TR' },
    { a: 'TL', b: 'TR' },
    { a: 'TL', b: 'R' },
    { a: 'TR', b: 'L' },
    { a: 'TL', b: 'P' },
    { a: 'TR', b: 'P' },
  ],
};

export const TRACE_GRAPHS = [T1, T2, T3];

/* ---------- scene 3: Königsberg, 1736 ---------- */

/** Degrees 3, 3, 5, 3 — all four landmasses odd; no walk exists. */
export const KONIGSBERG: GraphDef = {
  id: 'konigsberg',
  viewBox: '0 0 340 250',
  nodes: [
    { id: 'N', x: 160, y: 45, emoji: '🏰' },
    { id: 'S', x: 160, y: 205, emoji: '🏰' },
    { id: 'I', x: 100, y: 125, emoji: '🏝️' },
    { id: 'E', x: 290, y: 125, emoji: '🌲' },
  ],
  edges: [
    { a: 'N', b: 'I', curve: -22 },
    { a: 'N', b: 'I', curve: 22 },
    { a: 'S', b: 'I', curve: -22 },
    { a: 'S', b: 'I', curve: 22 },
    { a: 'N', b: 'E' },
    { a: 'S', b: 'E' },
    { a: 'I', b: 'E' },
  ],
};

/* ---------- scene 4: predict before you ride ---------- */

export interface PredictRound {
  graph: GraphDef;
  possible: boolean;
}

const square = (id: string, extra: GraphEdge[], extraNodes: GraphNode[] = []): GraphDef => ({
  id,
  viewBox: '0 0 300 240',
  nodes: [
    { id: 'A', x: 70, y: 55, emoji: '🏰' },
    { id: 'B', x: 230, y: 55, emoji: '🏰' },
    { id: 'C', x: 230, y: 195, emoji: '🏰' },
    { id: 'D', x: 70, y: 195, emoji: '🏰' },
    ...extraNodes,
  ],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'C', b: 'D' },
    { a: 'D', b: 'A' },
    ...extra,
  ],
});

export const PREDICT_ROUNDS: PredictRound[] = [
  // C4 ring: all even → possible.
  { graph: square('p1', []), possible: true },
  // K4: four odd castles → impossible.
  {
    graph: square('p2', [
      { a: 'A', b: 'C' },
      { a: 'B', b: 'D' },
    ]),
    possible: false,
  },
  // One diagonal: exactly two odd → possible.
  { graph: square('p3', [{ a: 'A', b: 'C' }]), possible: true },
  // Two tails on opposite corners: four odd → impossible.
  {
    graph: square(
      'p4',
      [
        { a: 'A', b: 'E' },
        { a: 'C', b: 'F' },
      ],
      [
        { id: 'E', x: 150, y: 20, emoji: '🗼' },
        { id: 'F', x: 150, y: 230, emoji: '🗼' },
      ]
    ),
    possible: false,
  },
  // Bowtie: all even → possible.
  {
    graph: {
      id: 'p5',
      viewBox: '0 0 320 220',
      nodes: [
        { id: 'A', x: 45, y: 45, emoji: '🏰' },
        { id: 'B', x: 45, y: 175, emoji: '🏰' },
        { id: 'M', x: 160, y: 110, emoji: '🏯' },
        { id: 'C', x: 275, y: 45, emoji: '🏰' },
        { id: 'D', x: 275, y: 175, emoji: '🏰' },
      ],
      edges: [
        { a: 'A', b: 'B' },
        { a: 'A', b: 'M' },
        { a: 'B', b: 'M' },
        { a: 'C', b: 'D' },
        { a: 'C', b: 'M' },
        { a: 'D', b: 'M' },
      ],
    },
    possible: true,
  },
  // A doubled middle bridge — a little Königsberg echo: four odd → impossible.
  {
    graph: {
      id: 'p6',
      viewBox: '0 0 340 160',
      nodes: [
        { id: 'A', x: 40, y: 80, emoji: '🏰' },
        { id: 'B', x: 130, y: 80, emoji: '🏰' },
        { id: 'C', x: 220, y: 80, emoji: '🏰' },
        { id: 'D', x: 310, y: 80, emoji: '🏰' },
      ],
      edges: [
        { a: 'A', b: 'B' },
        { a: 'B', b: 'C', curve: -18 },
        { a: 'B', b: 'C', curve: 18 },
        { a: 'C', b: 'D' },
      ],
    },
    possible: false,
  },
];

/* ---------- scene 5: the banner festival ---------- */

/** Contains a triangle, so two colors can't work — three always can. */
export const BANNER_GRAPH: GraphDef = {
  id: 'banners',
  viewBox: '0 0 340 260',
  nodes: [
    { id: 'A', x: 170, y: 55, emoji: '🏰' },
    { id: 'B', x: 70, y: 195, emoji: '🏰' },
    { id: 'C', x: 270, y: 195, emoji: '🏰' },
    { id: 'D', x: 100, y: 105, emoji: '🏯' },
    { id: 'E', x: 170, y: 235, emoji: '🏯' },
    { id: 'F', x: 240, y: 105, emoji: '🏯' },
  ],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'C', b: 'A' },
    { a: 'D', b: 'A' },
    { a: 'D', b: 'B' },
    { a: 'E', b: 'B' },
    { a: 'E', b: 'C' },
    { a: 'F', b: 'C' },
    { a: 'F', b: 'A' },
  ],
};
