const LIGHT_ROWS = [
  { top: '9%', sag: 22, count: 11, delay: 0 },
  { top: '20%', sag: 16, count: 9, delay: 1.1 },
];

const FLAG_COLORS = ['var(--pink)', 'var(--teal)', 'var(--gold)'];

const MARKS = [
  { left: '5%', top: '38%', size: '2.6rem' },
  { left: '92%', top: '30%', size: '2rem' },
  { left: '86%', top: '64%', size: '1.6rem' },
];

/**
 * The fairground at dusk: bunting flags along the top, two sagging rows of
 * string lights, faint % watermarks and the big-top silhouette along the
 * bottom. Purely decorative (aria-hidden).
 */
export default function CarnivalBackground() {
  return (
    <div className="carnival-bg" aria-hidden="true">
      <div className="carnival-sky" />
      <div className="carnival-bunting">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="carnival-flag"
            style={{ borderTopColor: FLAG_COLORS[i % FLAG_COLORS.length] }}
          />
        ))}
      </div>
      {LIGHT_ROWS.map((row, r) => (
        <div key={r} className="carnival-lights" style={{ top: row.top }}>
          {Array.from({ length: row.count }, (_, i) => {
            // A gentle catenary-ish sag: lowest in the middle of the row.
            const x = i / (row.count - 1);
            const sag = row.sag * 4 * x * (1 - x);
            return (
              <span
                key={i}
                className="carnival-lamp"
                style={{
                  left: `${4 + x * 92}%`,
                  top: `${sag}px`,
                  animationDelay: `${row.delay + i * 0.35}s`,
                }}
              />
            );
          })}
        </div>
      ))}
      {MARKS.map((mark, i) => (
        <span
          key={i}
          className="carnival-mark"
          style={{ left: mark.left, top: mark.top, fontSize: mark.size }}
        >
          %
        </span>
      ))}
      <div className="carnival-tent" />
    </div>
  );
}
