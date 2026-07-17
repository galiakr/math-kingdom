import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GraphTracer from '../GraphTracer';
import { TRACE_GRAPHS, oddNodes } from '../graphs';
import type { SceneProps } from './types';

/**
 * Scene 2 — the knight's patrol: three ramping graphs, each walked crossing
 * every bridge exactly once. Getting stuck escalates hints toward the odd-
 * castle secret, but never locks anything.
 */
export default function SceneTrace({ flow }: SceneProps) {
  const { t } = useTranslation();
  const [roundIndex, setRoundIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stuckCount, setStuckCount] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const graph = TRACE_GRAPHS[roundIndex];
  const total = graph.edges.length;

  useEffect(() => {
    if (finished) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const complete = () => {
    setCelebrating(true);
    timerRef.current = window.setTimeout(() => {
      setCelebrating(false);
      if (roundIndex < TRACE_GRAPHS.length - 1) {
        setRoundIndex(roundIndex + 1);
        setProgress(0);
        setStuckCount(0);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  return (
    <div className="gk-body">
      <p className="gk-hint">
        {finished
          ? t('graphs.scenes.trace.done')
          : celebrating
            ? t('graphs.scenes.trace.roundDone')
            : stuckCount >= 2
              ? t('graphs.scenes.trace.stuckHint2')
              : stuckCount >= 1
                ? t('graphs.scenes.trace.stuckHint1')
                : t('graphs.scenes.trace.prompt')}
      </p>

      {!finished && (
        <>
          <GraphTracer
            key={graph.id}
            graph={graph}
            label={t('graphs.scenes.trace.title')}
            startHints={stuckCount >= 2 ? oddNodes(graph) : []}
            showBadges={stuckCount >= 2}
            onProgress={(crossed) => setProgress(crossed)}
            onComplete={complete}
            onStuck={() => setStuckCount((n) => n + 1)}
            onReset={() => setProgress(0)}
          />
          <p className="gk-counter">
            {t('graphs.scenes.trace.progress')}{' '}
            <span className="gk-ltr gk-count-chip">
              {progress} / {total}
            </span>{' '}
            <span className="gk-ltr gk-count-chip">
              {roundIndex + 1} / {TRACE_GRAPHS.length}
            </span>
          </p>
        </>
      )}

      {celebrating && <p className="gk-feedback">🎉</p>}
    </div>
  );
}
