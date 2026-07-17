import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import GraphView from '../GraphView';
import { PREDICT_ROUNDS, degree } from '../graphs';
import type { PredictRound } from '../graphs';
import type { SceneProps } from './types';

/**
 * Scene 4 — the dragon's test: predict possible/impossible BEFORE riding,
 * by counting odd castles. The counting tool is always allowed — using the
 * theorem is the whole point.
 */
export default function ScenePredict({ flow }: SceneProps) {
  const { t } = useTranslation();
  const runner = useExerciseRunner<PredictRound, boolean>(
    PREDICT_ROUNDS,
    (round, possible) => possible === round.possible
  );
  const [counting, setCounting] = useState(false);
  const [counted, setCounted] = useState<ReadonlySet<string>>(new Set());
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const graph = runner.round.graph;
  const revealAll = runner.attempts >= 2;

  const answer = (possible: boolean) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(possible) === 'correct') {
      setStamped(true);
      window.setTimeout(() => {
        setStamped(false);
        setCounting(false);
        setCounted(new Set());
        runner.next();
      }, 1100);
    }
  };

  const badges = Object.fromEntries(
    graph.nodes
      .filter((n) => revealAll || (counting && counted.has(n.id)))
      .map((n) => [n.id, degree(graph, n.id)])
  );

  return (
    <div className="gk-body">
      {!runner.done && (
        <>
          <p className="gk-hint">🐉 {t('graphs.scenes.predict.prompt')}</p>

          <div className="gk-predict-board">
            <GraphView
              graph={graph}
              badges={badges}
              label={t('graphs.scenes.predict.title')}
              nodeClass={(id) =>
                counting && !counted.has(id) && !revealAll ? 'is-start-hint' : ''
              }
              onNodeTap={
                counting
                  ? (id) => setCounted((c) => new Set(c).add(id))
                  : undefined
              }
            />
            {stamped && (
              <span
                className={`gk-stamp ${runner.round.possible ? 'gk-stamp-yes' : 'gk-stamp-no'}`}
                aria-hidden="true"
              >
                {runner.round.possible
                  ? t('graphs.scenes.predict.stampYes')
                  : t('graphs.scenes.predict.stampNo')}
              </span>
            )}
          </div>

          <div className="controls">
            <button
              type="button"
              className="btn btn-ghost"
              aria-pressed={counting}
              onClick={() => setCounting((c) => !c)}
            >
              🔢 {t('graphs.buttons.countBridges')}
            </button>
          </div>

          <div className="gk-verdict-row">
            <button
              type="button"
              className="gk-verdict gk-verdict-yes"
              disabled={runner.solved}
              onClick={() => answer(true)}
            >
              🐴 {t('graphs.scenes.predict.possible')}
            </button>
            <button
              type="button"
              className="gk-verdict gk-verdict-no"
              disabled={runner.solved}
              onClick={() => answer(false)}
            >
              🐉 {t('graphs.scenes.predict.impossible')}
            </button>
          </div>

          <p className="gk-counter">
            <span className="gk-ltr gk-count-chip">
              {Math.min(runner.index + 1, runner.total)} / {runner.total}
            </span>
          </p>
        </>
      )}

      <p className="gk-feedback" aria-live="polite">
        {runner.done
          ? t('graphs.scenes.predict.done')
          : runner.result === 'correct'
            ? t('graphs.scenes.predict.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('graphs.scenes.predict.retryHint2')
                : t('graphs.scenes.predict.retry')
              : ' '}
      </p>
    </div>
  );
}
