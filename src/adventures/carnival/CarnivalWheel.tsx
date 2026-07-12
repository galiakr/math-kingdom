import { useMemo } from 'react';
import type { TransitionEventHandler } from 'react';
import { polar, sectorPath, totalWeight } from './wheel';
import type { WheelSector } from './wheel';

interface CarnivalWheelProps {
  sectors: WheelSector[];
  /** Cumulative rotation in degrees; the parent owns the spin state. */
  rotation?: number;
  spinning?: boolean;
  onSettle?: TransitionEventHandler<HTMLDivElement>;
  label?: string;
  className?: string;
}

const BULBS = Array.from({ length: 12 }, (_, i) => polar(i * 30, 48.5));

/**
 * The carnival wheel every game shares. The disc is a rotated <div> (CSS
 * transform-origin quirks make SVG groups a poor spin target); the frame,
 * lightbulbs and pointer stay put around it.
 */
export default function CarnivalWheel({
  sectors,
  rotation = 0,
  spinning = false,
  onSettle,
  label,
  className = '',
}: CarnivalWheelProps) {
  const slices = useMemo(() => {
    const total = totalWeight(sectors);
    let angle = 0;
    return sectors.map((sector) => {
      const span = (sector.weight / total) * 360;
      const start = angle;
      angle += span;
      const [ex, ey] = polar(start + span / 2, 30);
      return { sector, path: sectorPath(start, start + span), ex, ey, span };
    });
  }, [sectors]);

  return (
    <div
      className={`cv-wheel${className ? ` ${className}` : ''}`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
    >
      <div
        className={`cv-wheel-disc${spinning ? ' is-spinning' : ''}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={onSettle}
      >
        <svg viewBox="0 0 100 100">
          {slices.map(({ sector, path, ex, ey, span }) => (
            <g key={sector.id}>
              <path d={path} className="cv-slice" style={{ fill: sector.colorVar }} />
              {span >= 30 && (
                <text x={ex} y={ey} className="cv-slice-emoji" textAnchor="middle" dy="0.35em">
                  {sector.emoji}
                </text>
              )}
            </g>
          ))}
          <circle cx="50" cy="50" r="7" className="cv-wheel-hub" />
        </svg>
      </div>
      <svg viewBox="0 0 100 100" className="cv-wheel-frame">
        <circle cx="50" cy="50" r="49" className="cv-wheel-ring" />
        {BULBS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" className="cv-bulb" />
        ))}
      </svg>
      <div className="cv-wheel-pointer" />
    </div>
  );
}
