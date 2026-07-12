const STEAM = [
  { left: '12%', delay: 0, duration: 26 },
  { left: '38%', delay: 8, duration: 32 },
  { left: '71%', delay: 4, duration: 28 },
  { left: '88%', delay: 14, duration: 34 },
];

const WATERMARKS = [
  { glyph: '∆', left: '6%', top: '22%', size: '3.2rem' },
  { glyph: '🌿', left: '90%', top: '18%', size: '2rem' },
  { glyph: '∆', left: '82%', top: '52%', size: '2.4rem' },
  { glyph: '🌿', left: '10%', top: '60%', size: '1.7rem' },
];

/**
 * The trattoria backdrop: apricot oven glow in the corner, drifting steam,
 * faint triangle watermarks, and a red-checkered tablecloth band along the
 * bottom. Purely decorative (aria-hidden).
 */
export default function PalaceBackground() {
  return (
    <div className="palace-bg" aria-hidden="true">
      <div className="palace-glow" />
      {WATERMARKS.map((mark, i) => (
        <span
          key={i}
          className="palace-mark"
          style={{ left: mark.left, top: mark.top, fontSize: mark.size }}
        >
          {mark.glyph}
        </span>
      ))}
      {STEAM.map((wisp, i) => (
        <span
          key={i}
          className="palace-steam"
          style={{
            left: wisp.left,
            animationDelay: `${wisp.delay}s`,
            animationDuration: `${wisp.duration}s`,
          }}
        />
      ))}
      <div className="palace-cloth" />
    </div>
  );
}
