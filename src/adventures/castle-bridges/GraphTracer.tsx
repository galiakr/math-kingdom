import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GraphView from './GraphView';
import { degree, nodeById } from './graphs';
import type { GraphDef } from './graphs';

interface GraphTracerProps {
  graph: GraphDef;
  disabled?: boolean;
  /** Castles to glow as suggested starting points (hint escalation). */
  startHints?: string[];
  showBadges?: boolean;
  label?: string;
  onProgress?: (crossed: number, total: number) => void;
  onComplete?: () => void;
  /** The knight has bridges left somewhere, but none at their castle. */
  onStuck?: () => void;
  onReset?: () => void;
}

/**
 * The knight's walk: tap a castle to start, then tap neighbors to cross
 * untraversed bridges. Wrong taps wiggle, never punish. When two parallel
 * bridges join the same castles, the first untraversed one is crossed —
 * parallel bridges are interchangeable, so this never affects solvability.
 * The knight's slide is pure decoration; state updates instantly.
 */
export default function GraphTracer({
  graph,
  disabled = false,
  startHints = [],
  showBadges = false,
  label,
  onProgress,
  onComplete,
  onStuck,
  onReset,
}: GraphTracerProps) {
  const { t } = useTranslation();
  const [knightAt, setKnightAt] = useState<string | null>(null);
  const [crossed, setCrossed] = useState<readonly number[]>([]);
  const [stuck, setStuck] = useState(false);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const wiggleTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(wiggleTimer.current), []);

  const wiggle = (id: string) => {
    window.clearTimeout(wiggleTimer.current);
    setWiggleId(id);
    wiggleTimer.current = window.setTimeout(() => setWiggleId(null), 380);
  };

  const hasExit = (at: string, crossedNow: readonly number[]) =>
    graph.edges.some(
      (e, i) => !crossedNow.includes(i) && (e.a === at || e.b === at)
    );

  const tap = (id: string) => {
    if (disabled || crossed.length === graph.edges.length) return;
    if (knightAt === null) {
      setKnightAt(id);
      return;
    }
    const candidate = graph.edges.findIndex(
      (e, i) =>
        !crossed.includes(i) &&
        ((e.a === knightAt && e.b === id) || (e.b === knightAt && e.a === id))
    );
    if (candidate === -1) {
      wiggle(id);
      return;
    }
    const next = [...crossed, candidate];
    setCrossed(next);
    setKnightAt(id);
    onProgress?.(next.length, graph.edges.length);
    if (next.length === graph.edges.length) {
      setStuck(false);
      onComplete?.();
    } else if (!hasExit(id, next)) {
      setStuck(true);
      onStuck?.();
    } else {
      setStuck(false);
    }
  };

  const reset = () => {
    setKnightAt(null);
    setCrossed([]);
    setStuck(false);
    onReset?.();
  };

  const badges = showBadges
    ? Object.fromEntries(graph.nodes.map((n) => [n.id, degree(graph, n.id)]))
    : undefined;

  const knight = knightAt ? nodeById(graph, knightAt) : null;

  return (
    <div className="gk-tracer">
      <GraphView
        graph={graph}
        crossedEdges={new Set(crossed)}
        badges={badges}
        label={label}
        nodeClass={(id) =>
          `${wiggleId === id ? 'is-wiggling' : ''}${
            knightAt === null && startHints.includes(id) ? ' is-start-hint' : ''
          }`
        }
        onNodeTap={tap}
      >
        {knight && (
          <g
            className="gk-knight"
            style={{ transform: `translate(${knight.x}px, ${knight.y - 30}px)` }}
          >
            <text textAnchor="middle" className="gk-knight-emoji">
              {stuck ? '🛡️' : '🐴'}
            </text>
            {stuck && (
              <text y="-18" textAnchor="middle" className="gk-knight-thought">
                💭
              </text>
            )}
          </g>
        )}
      </GraphView>
      <button type="button" className="btn btn-ghost gk-reset" onClick={reset}>
        🔄 {t('graphs.buttons.reset')}
      </button>
    </div>
  );
}
