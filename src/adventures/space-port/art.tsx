/**
 * All shapes whose holes matter are drawn here with fill-rule="evenodd",
 * so every hole is a real hole — the background shows through, and hint
 * rings can sit inside them. Emoji are used only where the platform art
 * is unambiguous about holes.
 */

interface ArtProps {
  size?: number;
  className?: string;
}

/** The mug that becomes a donut — also cargo/customs item art (☕ emoji hides its handle hole). */
export function MugArt({ size = 72, className = '' }: ArtProps) {
  return (
    <svg viewBox="30 20 160 130" width={size} className={`tp-art ${className}`}>
      <rect x="50" y="30" width="80" height="110" rx="14" className="tp-shape" />
      <path
        fillRule="evenodd"
        className="tp-shape"
        d="M178,85 A28,28 0 1 0 122,85 A28,28 0 1 0 178,85 Z
           M164,85 A14,14 0 1 1 136,85 A14,14 0 1 1 164,85 Z"
      />
      <ellipse cx="90" cy="36" rx="34" ry="9" className="tp-shape-dent" />
    </svg>
  );
}

/** A two-hole button. */
export function ButtonArt({ size = 64, className = '' }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} className={`tp-art ${className}`}>
      <path
        fillRule="evenodd"
        className="tp-shape"
        d="M58,32 A26,26 0 1 0 6,32 A26,26 0 1 0 58,32 Z
           M28,32 A5,5 0 1 1 18,32 A5,5 0 1 1 28,32 Z
           M46,32 A5,5 0 1 1 36,32 A5,5 0 1 1 46,32 Z"
      />
      <circle cx="32" cy="32" r="22" className="tp-shape-rim" />
    </svg>
  );
}

/** Eyeglass frames with no lenses — both loops show the background through. */
export function GlassesArt({ size = 72, className = '' }: ArtProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} className={`tp-art ${className}`}>
      <path
        fillRule="evenodd"
        className="tp-shape"
        d="M29,32 A13,13 0 1 0 3,32 A13,13 0 1 0 29,32 Z
           M25,32 A9,9 0 1 1 7,32 A9,9 0 1 1 25,32 Z
           M61,32 A13,13 0 1 0 35,32 A13,13 0 1 0 61,32 Z
           M57,32 A9,9 0 1 1 39,32 A9,9 0 1 1 57,32 Z"
      />
      <rect x="27" y="28" width="10" height="5" rx="2" className="tp-shape" />
    </svg>
  );
}

/** Gloop's stretchy body — posed purely via CSS transform classes. */
export function BlobArt({ size = 170, className = '' }: ArtProps) {
  return (
    <svg viewBox="0 0 120 100" width={size} className={`tp-art tp-blob ${className}`}>
      <path
        className="tp-shape-blob"
        d="M20,55 C15,25 45,15 62,20 C85,12 105,30 100,50
           C108,70 85,88 60,85 C35,90 24,78 20,55 Z"
      />
      <circle cx="45" cy="45" r="9" className="tp-blob-eye" />
      <circle cx="75" cy="42" r="9" className="tp-blob-eye" />
      <circle cx="47" cy="46" r="4" className="tp-blob-pupil" />
      <circle cx="76" cy="43" r="4" className="tp-blob-pupil" />
      <path d="M50,66 Q62,74 74,64" className="tp-blob-smile" />
    </svg>
  );
}

/** Per-stage geometry of the one hole that survives the whole morph. */
export const HOLE_RING = [
  { cx: 150, cy: 85, rx: 13, ry: 13 },
  { cx: 152, cy: 90, rx: 11, ry: 11 },
  { cx: 140, cy: 95, rx: 13, ry: 13 },
  { cx: 118, cy: 95, rx: 15, ry: 14 },
  { cx: 110, cy: 95, rx: 19, ry: 15 },
];

export const MORPH_STAGES = HOLE_RING.length;

interface MorphProps {
  stage: number;
  /** The "that's a dent, not a hole" hint marker over the cup cavity. */
  showDent?: boolean;
  className?: string;
}

/**
 * The Mug Machine's viewport: five always-mounted stage drawings that
 * cross-fade via CSS; the dashed hole ring glides between stages. Nothing
 * listens to transition events — a skipped transition just snaps, harmlessly.
 */
export function MorphStages({ stage, showDent = false, className = '' }: MorphProps) {
  const ring = HOLE_RING[stage];
  return (
    <svg viewBox="0 0 220 170" className={`tp-morph tp-ltr ${className}`}>
      {/* S0 — the mug */}
      <g className={stage === 0 ? 'is-active' : ''}>
        <rect x="50" y="30" width="80" height="110" rx="14" className="tp-shape" />
        <path
          fillRule="evenodd"
          className="tp-shape"
          d="M178,85 A28,28 0 1 0 122,85 A28,28 0 1 0 178,85 Z
             M164,85 A14,14 0 1 1 136,85 A14,14 0 1 1 164,85 Z"
        />
        <ellipse cx="90" cy="36" rx="34" ry="9" className="tp-shape-dent" />
      </g>
      {/* S1 — squat mug, thicker handle */}
      <g className={stage === 1 ? 'is-active' : ''}>
        <rect x="45" y="55" width="90" height="85" rx="18" className="tp-shape" />
        <path
          fillRule="evenodd"
          className="tp-shape"
          d="M184,90 A32,32 0 1 0 120,90 A32,32 0 1 0 184,90 Z
             M163,90 A11,11 0 1 1 141,90 A11,11 0 1 1 163,90 Z"
        />
        <ellipse cx="90" cy="60" rx="38" ry="7" className="tp-shape-dent" />
      </g>
      {/* S2 — a blob with one hole; the cup melted into the handle */}
      <g className={stage === 2 ? 'is-active' : ''}>
        <path
          fillRule="evenodd"
          className="tp-shape"
          d="M45,100 C45,60 90,50 115,55 C150,58 180,70 180,100
             C180,130 150,142 110,140 C70,140 45,130 45,100 Z
             M153,95 A13,13 0 1 1 127,95 A13,13 0 1 1 153,95 Z"
        />
      </g>
      {/* S3 — a fat ring with a lump where the cup was */}
      <g className={stage === 3 ? 'is-active' : ''}>
        <path
          fillRule="evenodd"
          className="tp-shape"
          d="M48,95 C40,60 80,48 115,52 C160,50 174,70 172,95
             C174,122 150,140 112,140 C75,140 55,128 48,95 Z
             M133,95 A15,14 0 1 1 103,95 A15,14 0 1 1 133,95 Z"
        />
      </g>
      {/* S4 — the donut, frosting and all */}
      <g className={stage === 4 ? 'is-active' : ''}>
        <path
          fillRule="evenodd"
          className="tp-shape"
          d="M174,95 A64,46 0 1 0 46,95 A64,46 0 1 0 174,95 Z
             M130,95 A20,16 0 1 1 90,95 A20,16 0 1 1 130,95 Z"
        />
        <path
          fillRule="evenodd"
          className="tp-frosting"
          d="M166,88 A56,30 0 1 0 54,88 A56,30 0 1 0 166,88 Z
             M132,92 A22,14 0 1 1 88,92 A22,14 0 1 1 132,92 Z"
        />
        <rect x="72" y="70" width="9" height="3.5" rx="1.7" className="tp-sprinkle-a" transform="rotate(-24 76 72)" />
        <rect x="100" y="62" width="9" height="3.5" rx="1.7" className="tp-sprinkle-b" transform="rotate(14 104 64)" />
        <rect x="136" y="70" width="9" height="3.5" rx="1.7" className="tp-sprinkle-a" transform="rotate(30 140 72)" />
        <rect x="58" y="92" width="9" height="3.5" rx="1.7" className="tp-sprinkle-b" transform="rotate(70 62 94)" />
        <rect x="146" y="94" width="9" height="3.5" rx="1.7" className="tp-sprinkle-a" transform="rotate(-60 150 96)" />
      </g>

      {/* the one hole, tracked across every stage */}
      <ellipse
        className="tp-hole-ring"
        cx={ring.cx}
        cy={ring.cy}
        rx={ring.rx}
        ry={ring.ry}
      />

      {showDent && stage <= 1 && (
        <g className="tp-dent-mark">
          <ellipse cx="90" cy={stage === 0 ? 36 : 60} rx="36" ry="10" />
          <text x="90" y={stage === 0 ? 22 : 46} textAnchor="middle">
            ✕
          </text>
        </g>
      )}
    </svg>
  );
}
