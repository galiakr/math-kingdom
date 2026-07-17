const STARS = [
  { left: '8%', top: '14%', size: 5, delay: 0 },
  { left: '22%', top: '32%', size: 3, delay: 1.2 },
  { left: '35%', top: '10%', size: 4, delay: 2.4 },
  { left: '52%', top: '24%', size: 3, delay: 0.6 },
  { left: '66%', top: '9%', size: 5, delay: 3.1 },
  { left: '79%', top: '30%', size: 3, delay: 1.8 },
  { left: '90%', top: '16%', size: 4, delay: 2.8 },
  { left: '14%', top: '58%', size: 3, delay: 3.6 },
  { left: '84%', top: '60%', size: 4, delay: 0.9 },
  { left: '45%', top: '70%', size: 3, delay: 2.1 },
];

/**
 * The Space Port backdrop: teal cosmos, violet-and-mint nebulas, twinkling
 * stars, a ringed planet whose ring echoes the hole motif, a torus space
 * station watermark, and a slow-drifting saucer. Purely decorative
 * (aria-hidden).
 */
export default function SpaceBackground() {
  return (
    <div className="space-bg" aria-hidden="true">
      <div className="space-nebula space-nebula-violet" />
      <div className="space-nebula space-nebula-mint" />
      {STARS.map((star, i) => (
        <span
          key={i}
          className="space-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      <svg viewBox="0 0 120 80" className="space-planet">
        <ellipse cx="60" cy="40" rx="26" ry="26" className="space-planet-body" />
        <ellipse cx="60" cy="40" rx="48" ry="12" className="space-planet-ring" />
      </svg>
      <svg viewBox="0 0 100 100" className="space-torus">
        <path
          fillRule="evenodd"
          d="M92,50 A42,30 0 1 0 8,50 A42,30 0 1 0 92,50 Z
             M64,50 A14,10 0 1 1 36,50 A14,10 0 1 1 64,50 Z"
        />
      </svg>
      <span className="space-mark" style={{ left: '6%', top: '44%' }}>
        ≈
      </span>
      <span className="space-mark" style={{ left: '88%', top: '78%', fontSize: '1.6rem' }}>
        ≈
      </span>
      <span className="space-ufo">🛸</span>
      <span className="space-jupiter">🪐</span>
      <div className="space-comet" />
    </div>
  );
}
