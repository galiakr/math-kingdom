import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode, TransitionEventHandler } from 'react';
import { SIERPINSKI, fractalAt } from './fractal';
import type { Rule, Tri } from './fractal';

interface FractalPizzaProps {
  depth: number;
  rule?: Rule;
  /** Scatter tomato + basil tints. Off for the zoom illusion — the coloring
   * itself must be self-similar, and only plain cheese is. */
  toppings?: boolean;
  onPieceTap?: (index: number) => void;
  label?: string;
  className?: string;
  /** Zoom-scene hooks on the piece group: transform, transition class, end event. */
  groupStyle?: CSSProperties;
  groupClassName?: string;
  onGroupTransitionEnd?: TransitionEventHandler<SVGGElement>;
  /** Extra SVG drawn above the pieces (e.g. zoom hotspots). */
  children?: ReactNode;
}

const points = (tri: Tri) => tri.map((p) => p.join(',')).join(' ');

/** A deterministic sprinkle of toppings that reads the same on every render. */
const toppingClass = (i: number) =>
  i % 4 === 1 ? ' pz-piece-tomato' : i % 9 === 7 ? ' pz-piece-basil' : '';

/**
 * The one pizza every scene shares: a flat list of triangle polygons from
 * fractalAt(). Crust strokes only while the pieces are few — strokes, not
 * fills, are what makes many-polygon SVGs slow.
 */
export default function FractalPizza({
  depth,
  rule = SIERPINSKI,
  toppings = true,
  onPieceTap,
  label,
  className = '',
  groupStyle,
  groupClassName = '',
  onGroupTransitionEnd,
  children,
}: FractalPizzaProps) {
  const pieces = useMemo(() => fractalAt(depth, rule), [depth, rule]);
  // Restart the pulse animation even when the same piece is tapped twice.
  const [pulse, setPulse] = useState<{ index: number; at: number } | null>(null);

  const crusty = pieces.length < 100;

  return (
    <svg
      viewBox="0 0 100 87"
      className={`pz-pizza${crusty ? ' pz-crusty' : ''}${onPieceTap ? ' is-tappable' : ''}${
        className ? ` ${className}` : ''
      }`}
      role={label ? 'img' : 'presentation'}
      aria-label={label}
    >
      <g
        className={groupClassName}
        style={groupStyle}
        onTransitionEnd={onGroupTransitionEnd}
      >
        {pieces.map((tri, i) => (
          <polygon
            key={pulse?.index === i ? `p-${pulse.at}` : i}
            points={points(tri)}
            className={`pz-piece${toppings ? toppingClass(i) : ''}${
              pulse?.index === i ? ' is-pulsing' : ''
            }`}
            onClick={
              onPieceTap &&
              (() => {
                setPulse({ index: i, at: Date.now() });
                onPieceTap(i);
              })
            }
          />
        ))}
      </g>
      {children}
    </svg>
  );
}
