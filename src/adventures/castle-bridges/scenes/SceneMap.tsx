import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import GraphView from '../GraphView';
import { MAP_GRAPH } from '../graphs';
import type { SceneProps } from './types';

interface CountRound {
  id: 'dots' | 'lines';
  choices: number[];
  correct: number;
}

const QUIZ: CountRound[] = [
  { id: 'dots', choices: [4, 5, 6], correct: MAP_GRAPH.nodes.length },
  { id: 'lines', choices: [5, 6, 7], correct: MAP_GRAPH.edges.length },
];

type Phase = 'nodes' | 'edges' | 'quiz';

/**
 * Scene 1 — the mapmaker's secret: tap every castle, then every road, then
 * strip the pictures away and what's left is a graph — dots and lines.
 */
export default function SceneMap({ flow }: SceneProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('nodes');
  const [marked, setMarked] = useState<ReadonlySet<string>>(new Set());
  const [markedEdges, setMarkedEdges] = useState<ReadonlySet<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const runner = useExerciseRunner<CountRound, number>(
    QUIZ,
    (round, n) => n === round.correct
  );

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const tapNode = (id: string) => {
    if (phase !== 'nodes') return;
    const next = new Set(marked);
    next.add(id);
    setMarked(next);
    if (next.size === MAP_GRAPH.nodes.length) setPhase('edges');
  };

  const tapEdge = (index: number) => {
    if (phase !== 'edges') return;
    const next = new Set(markedEdges);
    next.add(index);
    setMarkedEdges(next);
  };

  const allEdgesMarked = markedEdges.size === MAP_GRAPH.edges.length;

  const answer = (n: number) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(n) === 'correct') {
      window.setTimeout(runner.next, 900);
    }
  };

  return (
    <div className="gk-body">
      <p className="gk-hint">
        {phase === 'nodes'
          ? t('graphs.scenes.map.tapCastles')
          : phase === 'edges'
            ? allEdgesMarked
              ? t('graphs.scenes.map.revealPrompt')
              : t('graphs.scenes.map.tapRoads')
            : runner.done
              ? t('graphs.scenes.map.done')
              : t(`graphs.scenes.map.${runner.round.id === 'dots' ? 'qDots' : 'qLines'}`)}
      </p>

      <div className={`gk-map-frame${revealed ? ' is-revealed' : ''}`}>
        <GraphView
          graph={MAP_GRAPH}
          crossedEdges={markedEdges}
          label={t('graphs.scenes.map.title')}
          nodeClass={(id) => (marked.has(id) ? 'is-marked' : '')}
          onNodeTap={phase === 'nodes' ? tapNode : undefined}
          onEdgeTap={phase === 'edges' && !allEdgesMarked ? tapEdge : undefined}
        />
      </div>

      {phase !== 'quiz' && (
        <p className="gk-counter">
          <span className="gk-ltr gk-count-chip">
            {phase === 'nodes'
              ? `${marked.size} / ${MAP_GRAPH.nodes.length}`
              : `${markedEdges.size} / ${MAP_GRAPH.edges.length}`}
          </span>
        </p>
      )}

      {phase === 'edges' && allEdgesMarked && (
        <div className="controls">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setRevealed(true);
              setPhase('quiz');
            }}
          >
            ✨ {t('graphs.buttons.reveal')}
          </button>
        </div>
      )}

      {phase === 'quiz' && !runner.done && (
        <div className="gk-choices gk-ltr">
          {runner.round.choices.map((n) => (
            <button
              key={n}
              type="button"
              className="gk-choice"
              disabled={runner.solved}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <p className="gk-feedback" aria-live="polite">
        {phase === 'quiz' && !runner.done
          ? runner.result === 'correct'
            ? t('graphs.scenes.map.correct')
            : runner.result === 'retry'
              ? t('graphs.scenes.map.retry')
              : ' '
          : ' '}
      </p>
    </div>
  );
}
