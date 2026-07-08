import { useMemo } from 'react';

const GLYPHS = ['π', '∞', '∑', '√', 'φ', '∆', '≈', '∫'];

interface Star {
  left: number;
  top: number;
  delay: number;
  size: number;
}

/**
 * The "night atlas" backdrop: faint graph paper, twinkling stars and a few
 * math glyphs drifting slowly upward. Purely decorative (aria-hidden).
 */
export default function AtlasBackground() {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 36 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        size: Math.random() < 0.2 ? 3 : 2,
      })),
    []
  );

  return (
    <div className="atlas" aria-hidden="true">
      <div className="atlas-grid" />
      {stars.map((star, i) => (
        <span
          key={i}
          className="atlas-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      {GLYPHS.map((glyph, i) => (
        <span
          key={glyph}
          className="atlas-glyph"
          style={{
            left: `${6 + i * 12.5}%`,
            animationDelay: `${i * 5.5}s`,
            animationDuration: `${34 + (i % 4) * 9}s`,
          }}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}
