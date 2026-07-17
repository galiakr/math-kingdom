import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import GraphTracer from '../GraphTracer';
import GraphView from '../GraphView';
import { KONIGSBERG, degree } from '../graphs';
import type { SceneProps } from './types';

const DRAGON_AFTER = 1;
const DRAGON_PULSE = 3;

interface QuizRound {
  id: 'howMany' | 'possible';
  choices: string[];
  correct: string;
}

const QUIZ: QuizRound[] = [
  { id: 'howMany', choices: ['2', '3', '4'], correct: '4' },
  { id: 'possible', choices: ['yes', 'no'], correct: 'no' },
];

type Phase = 'try' | 'count' | 'quiz' | 'proved';

/**
 * Scene 3 — the seven bridges of Königsberg. The child tries freely (best
 * possible is 6 of 7), then the dragon leads the 1736 proof: count the
 * bridges at each landmass, see that all four counts are odd, conclude the
 * walk is impossible. Understanding the impossibility IS the trophy.
 */
export default function SceneBridges({ flow }: SceneProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('try');
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(0);
  const [counted, setCounted] = useState<ReadonlySet<string>>(new Set());
  const runner = useExerciseRunner<QuizRound, string>(
    QUIZ,
    (round, choice) => choice === round.correct
  );

  useEffect(() => {
    if (runner.done) {
      setPhase('proved');
      flow.completeScene();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const bump = () => setTries((n) => n + 1);

  const countTap = (id: string) => {
    if (phase !== 'count') return;
    const next = new Set(counted);
    next.add(id);
    setCounted(next);
    if (next.size === KONIGSBERG.nodes.length) setPhase('quiz');
  };

  const answer = (choice: string) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(choice) === 'correct') {
      window.setTimeout(runner.next, 900);
    }
  };

  const badges = Object.fromEntries(
    KONIGSBERG.nodes
      .filter((n) => counted.has(n.id))
      .map((n) => [n.id, degree(KONIGSBERG, n.id)])
  );

  return (
    <div className="gk-body">
      <p className="gk-hint">
        {phase === 'try'
          ? t('graphs.scenes.bridges.tryPrompt')
          : phase === 'count'
            ? t('graphs.scenes.bridges.countPrompt')
            : phase === 'quiz'
              ? t(
                  `graphs.scenes.bridges.${runner.round.id === 'howMany' ? 'qOdd' : 'qPossible'}`
                )
              : t('graphs.scenes.bridges.done')}
      </p>

      {phase === 'try' && (
        <>
          <GraphTracer
            graph={KONIGSBERG}
            label={t('graphs.scenes.bridges.title')}
            onProgress={(crossed) => setBest((b) => Math.max(b, crossed))}
            onStuck={bump}
            onReset={bump}
          />
          <p className="gk-counter">
            {t('graphs.scenes.bridges.best')}{' '}
            <span className="gk-ltr gk-count-chip">
              {best} / {KONIGSBERG.edges.length}
            </span>
          </p>
          {tries >= DRAGON_AFTER && (
            <div className="controls">
              <button
                type="button"
                className={`btn btn-primary${tries >= DRAGON_PULSE ? ' gk-pulse' : ''}`}
                onClick={() => setPhase('count')}
              >
                🐉 {t('graphs.buttons.askDragon')}
              </button>
            </div>
          )}
        </>
      )}

      {(phase === 'count' || phase === 'quiz') && (
        <GraphView
          graph={KONIGSBERG}
          badges={badges}
          label={t('graphs.scenes.bridges.title')}
          nodeClass={(id) => (counted.has(id) ? 'is-marked' : phase === 'count' ? 'is-start-hint' : '')}
          onNodeTap={phase === 'count' ? countTap : undefined}
        />
      )}

      {phase === 'quiz' && !runner.done && (
        <div className={`gk-choices${runner.round.id === 'howMany' ? ' gk-ltr' : ''}`}>
          {runner.round.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className="gk-choice gk-choice-wide"
              disabled={runner.solved}
              onClick={() => answer(choice)}
            >
              {runner.round.id === 'howMany'
                ? choice
                : t(`graphs.scenes.bridges.${choice}`)}
            </button>
          ))}
        </div>
      )}

      <p className="gk-feedback" aria-live="polite">
        {phase === 'quiz'
          ? runner.result === 'correct'
            ? t('graphs.scenes.bridges.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('graphs.scenes.bridges.retryHint2')
                : t('graphs.scenes.bridges.retry')
              : ' '
          : ' '}
      </p>

      {phase === 'proved' && (
        <div className="gk-scroll">
          <h3 className="gk-scroll-title">📜 {t('graphs.scenes.bridges.provedTitle')}</h3>
          <p>{t('graphs.scenes.bridges.provedText')}</p>
          <span className="gk-scroll-dragon" aria-hidden="true">
            🐉
          </span>
        </div>
      )}
    </div>
  );
}
