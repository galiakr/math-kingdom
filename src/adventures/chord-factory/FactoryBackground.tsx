import { useMemo } from 'react';

const NOTES = ['♪', '♫', '♩', '♬', '♪', '♫', '♩', '♬'];

interface Sparkle {
  left: number;
  top: number;
  delay: number;
}

/**
 * The concert-hall backdrop: two warm spotlight beams over a dark stage and
 * faint music notes drifting upward. Purely decorative (aria-hidden).
 */
export default function FactoryBackground() {
  const sparkles = useMemo<Sparkle[]>(
    () =>
      Array.from({ length: 24 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div className="stage" aria-hidden="true">
      <div className="stage-beam stage-beam-left" />
      <div className="stage-beam stage-beam-right" />
      <div className="stage-floor" />
      {sparkles.map((sparkle, i) => (
        <span
          key={i}
          className="stage-sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        />
      ))}
      {NOTES.map((note, i) => (
        <span
          key={i}
          className="stage-note"
          style={{
            left: `${5 + i * 12}%`,
            animationDelay: `${i * 4.5}s`,
            animationDuration: `${26 + (i % 3) * 8}s`,
          }}
        >
          {note}
        </span>
      ))}
    </div>
  );
}
