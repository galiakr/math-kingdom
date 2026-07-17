import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import { MORPH_STAGES, MorphStages } from '../art';
import type { SceneProps } from './types';

interface StageRound {
  stage: number;
}

const ROUNDS: StageRound[] = Array.from({ length: MORPH_STAGES }, (_, stage) => ({ stage }));

/**
 * Scene 2 — the Mug Machine. At every morph stage the child counts holes;
 * the answer is 1 every single time — that certainty IS the lesson. The
 * morph button unlocks only after the current stage's count is confirmed.
 */
export default function SceneMorph({ flow }: SceneProps) {
  const { t } = useTranslation();
  // The answer never changes — stretching can't change the number of holes.
  const runner = useExerciseRunner<StageRound, number>(ROUNDS, (_round, answer) => answer === 1);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (n: number) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(n) === 'correct') {
      // The final stage's correct answer ends the round set directly.
      if (runner.index === ROUNDS.length - 1) window.setTimeout(runner.next, 900);
    }
  };

  const morph = () => {
    if (!runner.solved || stage >= MORPH_STAGES - 1) return;
    setStage(stage + 1);
    runner.next();
  };

  const showQuestion = !runner.done && !runner.solved;
  const canMorph = runner.solved && stage < MORPH_STAGES - 1;

  return (
    <div className="tp-body">
      <p className="tp-hint">
        {runner.done
          ? t('topology.scenes.morph.punchline')
          : t(`topology.scenes.morph.stages.s${stage}`)}
      </p>

      <div className="tp-machine">
        <MorphStages stage={stage} showDent={!runner.done && runner.attempts >= 2} />
        <div className="tp-stage-dots tp-ltr" aria-hidden="true">
          {ROUNDS.map((r) => (
            <span
              key={r.stage}
              className={`tp-stage-dot${r.stage === stage ? ' is-here' : ''}${
                r.stage < stage ? ' is-past' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {showQuestion && (
        <>
          <p className="tp-question-text">{t('topology.scenes.morph.holesPrompt')}</p>
          <div className="tp-choices tp-ltr">
            {[0, 1, 2].map((n) => (
              <button key={n} type="button" className="tp-choice" onClick={() => answer(n)}>
                {n}
              </button>
            ))}
          </div>
        </>
      )}

      {canMorph && (
        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={morph}>
            🌀 {t('topology.buttons.morph')}
          </button>
        </div>
      )}

      <p className="tp-feedback" aria-live="polite">
        {runner.done
          ? t('topology.scenes.morph.done')
          : runner.solved
            ? t('topology.scenes.morph.holeSurvived')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('topology.scenes.morph.retryHint2')
                : t('topology.scenes.morph.retry')
              : ' '}
      </p>
    </div>
  );
}
