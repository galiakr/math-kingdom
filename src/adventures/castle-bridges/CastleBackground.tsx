const CLOUDS = [
  { left: '10%', top: '10%', scale: 1, duration: 46 },
  { left: '55%', top: '6%', scale: 0.7, duration: 58 },
  { left: '80%', top: '16%', scale: 0.85, duration: 52 },
];

const FLAG_VARS = ['var(--banner-teal)', 'var(--flag-red)', 'var(--gold)'];

/**
 * The Castle Bridges backdrop: pale sky, drifting clouds, a pennant string,
 * a river with two arched bridges, a tower with a circling dragon, and a
 * crenellated stone wall along the bottom. Purely decorative (aria-hidden).
 */
export default function CastleBackground() {
  return (
    <div className="castle-bg" aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <span
          key={i}
          className="castle-cloud"
          style={{
            left: cloud.left,
            top: cloud.top,
            transform: `scale(${cloud.scale})`,
            animationDuration: `${cloud.duration}s`,
          }}
        >
          ☁️
        </span>
      ))}
      <div className="castle-bunting">
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className="castle-flag"
            style={{ borderTopColor: FLAG_VARS[i % FLAG_VARS.length] }}
          />
        ))}
      </div>
      <svg viewBox="0 0 400 120" className="castle-river" preserveAspectRatio="none">
        <path
          d="M0,60 C80,35 150,85 220,60 C290,35 340,80 400,55 L400,120 L0,120 Z"
          className="castle-river-water"
        />
        <path d="M70,52 q20,-22 40,0" className="castle-river-bridge" />
        <path d="M250,55 q20,-22 40,0" className="castle-river-bridge" />
      </svg>
      <div className="castle-tower">
        <span className="castle-dragon">🐉</span>
      </div>
      <span className="castle-mark" style={{ left: '6%', top: '32%' }}>
        ∴
      </span>
      <span className="castle-mark" style={{ left: '90%', top: '48%', fontSize: '1.5rem' }}>
        ∴
      </span>
      <div className="castle-wall" />
    </div>
  );
}
