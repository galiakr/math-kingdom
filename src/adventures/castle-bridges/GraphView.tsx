import type { ReactNode } from 'react';
import { edgePath } from './graphs';
import type { GraphDef } from './graphs';

interface GraphViewProps {
  graph: GraphDef;
  crossedEdges?: ReadonlySet<number>;
  /** nodeId → bridge count; shown as a badge (odd counts glow). */
  badges?: Record<string, number>;
  nodeClass?: (id: string) => string;
  edgeClass?: (index: number) => string;
  onNodeTap?: (id: string) => void;
  onEdgeTap?: (index: number) => void;
  label?: string;
  children?: ReactNode;
}

/**
 * The one castle-and-bridge board every scene shares. Taps land on generous
 * invisible hit shapes (r=26 circles, 26-unit strokes) so the visible art can
 * stay dainty; badges and per-node/edge classes let scenes decorate freely.
 */
export default function GraphView({
  graph,
  crossedEdges,
  badges,
  nodeClass,
  edgeClass,
  onNodeTap,
  onEdgeTap,
  label,
  children,
}: GraphViewProps) {
  return (
    <svg
      viewBox={graph.viewBox}
      className="gk-board"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
    >
      {graph.edges.map((edge, i) => {
        const d = edgePath(graph, edge);
        return (
          <g key={i}>
            <path
              d={d}
              className={`gk-edge${crossedEdges?.has(i) ? ' is-crossed' : ''}${
                edgeClass ? ` ${edgeClass(i)}` : ''
              }`}
            />
            {onEdgeTap && (
              <path d={d} className="gk-edge-hit" onClick={() => onEdgeTap(i)} />
            )}
          </g>
        );
      })}
      {graph.nodes.map((node) => (
        <g
          key={node.id}
          className={`gk-node${nodeClass ? ` ${nodeClass(node.id)}` : ''}`}
          onClick={onNodeTap && (() => onNodeTap(node.id))}
        >
          <circle cx={node.x} cy={node.y} r="26" className="gk-node-hit" />
          <circle cx={node.x} cy={node.y} r="15" className="gk-node-disc" />
          <text x={node.x} y={node.y} textAnchor="middle" dy="0.35em" className="gk-node-emoji">
            {node.emoji ?? '🏰'}
          </text>
          {badges && node.id in badges && (
            <g
              className={`gk-badge${badges[node.id] % 2 === 1 ? ' is-odd' : ''}`}
            >
              <circle cx={node.x + 20} cy={node.y - 18} r="10" />
              <text x={node.x + 20} y={node.y - 18} textAnchor="middle" dy="0.35em">
                {badges[node.id]}
              </text>
            </g>
          )}
        </g>
      ))}
      {children}
    </svg>
  );
}
