const COGS = [
  { left: '4%', top: '16%', size: 84, duration: 46 },
  { left: '92%', top: '10%', size: 60, duration: 34 },
  { left: '88%', top: '58%', size: 104, duration: 58 },
  { left: '7%', top: '66%', size: 56, duration: 38 },
];

const NOTES = ['♪', '♫', '♩', '♬', '♪', '♫'];

/**
 * The workshop backdrop: ivory paper wall, a walnut plank floor, slowly
 * turning brass cogs and a few drifting notes. Purely decorative
 * (aria-hidden).
 */
export default function FactoryBackground() {
  return (
    <div className="works-bg" aria-hidden="true">
      <div className="works-wall" />
      <div className="works-blueprint" />
      {COGS.map((cog, i) => (
        <svg
          key={i}
          className="works-cog"
          style={{
            left: cog.left,
            top: cog.top,
            width: cog.size,
            height: cog.size,
            animationDuration: `${cog.duration}s`,
          }}
          viewBox="0 0 100 100"
        >
          {Array.from({ length: 8 }, (_, tooth) => (
            <rect
              key={tooth}
              x="46"
              y="2"
              width="8"
              height="14"
              rx="2"
              fill="currentColor"
              transform={`rotate(${tooth * 45} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="36" fill="currentColor" />
          <circle cx="50" cy="50" r="14" fill="var(--bg, #f0e6d2)" />
        </svg>
      ))}
      {NOTES.map((note, i) => (
        <span
          key={i}
          className="works-note"
          style={{
            left: `${8 + i * 16}%`,
            animationDelay: `${i * 5}s`,
            animationDuration: `${30 + (i % 3) * 9}s`,
          }}
        >
          {note}
        </span>
      ))}
      <div className="works-floor" />
    </div>
  );
}
