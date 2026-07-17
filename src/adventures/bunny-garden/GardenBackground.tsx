import { SPIRAL_SQUARES } from './fib';

const SPRIGS = [
  { left: '6%', bottom: '54px', emoji: '🌷' },
  { left: '15%', bottom: '44px', emoji: '🌼' },
  { left: '82%', bottom: '58px', emoji: '🌷' },
  { left: '91%', bottom: '46px', emoji: '🌼' },
  { left: '70%', bottom: '42px', emoji: '🌱' },
];

const MARKS = [
  { left: '5%', top: '26%', size: '2.6rem' },
  { left: '92%', top: '20%', size: '2rem' },
  { left: '88%', top: '58%', size: '1.6rem' },
];

/**
 * The garden backdrop: rolling hills, flower sprigs along the meadow line,
 * two drifting butterflies, faint φ watermarks and a whisper of the golden
 * spiral in the corner. Purely decorative (aria-hidden).
 */
export default function GardenBackground() {
  return (
    <div className="garden-bg" aria-hidden="true">
      <div className="garden-hill garden-hill-far" />
      <div className="garden-hill garden-hill-near" />
      <svg viewBox="0 0 210 130" className="garden-spiral-mark">
        {SPIRAL_SQUARES.map((sq, i) => (
          <path key={i} d={sq.arc} />
        ))}
      </svg>
      {MARKS.map((mark, i) => (
        <span
          key={i}
          className="garden-phi"
          style={{ left: mark.left, top: mark.top, fontSize: mark.size }}
        >
          φ
        </span>
      ))}
      {SPRIGS.map((sprig, i) => (
        <span
          key={i}
          className="garden-sprig"
          style={{ left: sprig.left, bottom: sprig.bottom }}
        >
          {sprig.emoji}
        </span>
      ))}
      <span className="garden-butterfly" style={{ left: '18%', top: '30%' }}>
        🦋
      </span>
      <span
        className="garden-butterfly"
        style={{ left: '74%', top: '48%', animationDelay: '6s', animationDuration: '34s' }}
      >
        🦋
      </span>
      <div className="garden-meadow" />
    </div>
  );
}
