import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import FractalPizza from '../FractalPizza';
import type { SceneProps } from './types';

interface CountRound {
  level: number;
  choices: number[];
}

// Distractors sit one "3 × previous" step off the answer, so a near-miss
// still means the child was thinking in groups of the previous count.
const ROUNDS: CountRound[] = [
  { level: 1, choices: [2, 3, 4] },
  { level: 2, choices: [6, 9, 12] },
  { level: 3, choices: [18, 27, 36] },
  { level: 4, choices: [54, 81, 108] },
];

/**
 * Scene 3 — the pizza counter. Each slicing turns every piece into 3, so the
 * counts march 1 → 3 → 9 → 27 → 81; the growing strip makes the pattern
 * visible.
 */
export default function SceneCount({ flow }: SceneProps) {
  const { t } = useTranslation();
  const runner = useExerciseRunner<CountRound, number>(
    ROUNDS,
    (round, answer) => answer === 3 ** round.level
  );

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (n: number) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(n) === 'correct') {
      window.setTimeout(runner.next, 900);
    }
  };

  const level = runner.round.level;
  const previous = 3 ** (level - 1);
  // Chips of every count discovered so far; the current one lands on solve.
  const solvedLevels = runner.done ? ROUNDS.length : runner.index + (runner.solved ? 1 : 0);

  return (
    <div className="pz-body">
      {!runner.done && (
        <p className="pz-hint">{t('fractal.scenes.count.question')}</p>
      )}

      <FractalPizza
        depth={runner.done ? ROUNDS.length : runner.solved ? level : level - 1}
        className="pz-pizza-count"
        label={t('fractal.scenes.count.title')}
      />

      {!runner.done && (
        <div className="pz-choices pz-ltr">
          {runner.round.choices.map((n) => (
            <button
              key={n}
              type="button"
              className="pz-choice"
              disabled={runner.solved}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <p className="pz-feedback" aria-live="polite">
        {runner.done
          ? t('fractal.scenes.count.done')
          : runner.result === 'correct'
            ? t('fractal.scenes.count.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('fractal.scenes.count.hint2')
                : t('fractal.scenes.count.retry')
              : ' '}
        {!runner.done && runner.result === 'retry' && runner.attempts >= 2 && (
          <span className="pz-ltr pz-count-chip">
            3 × {previous} = ?
          </span>
        )}
      </p>

      <div className="pz-sequence pz-ltr" aria-label={t('fractal.scenes.count.sequence')}>
        <span className="pz-seq-chip">1</span>
        {ROUNDS.slice(0, solvedLevels).map((round) => (
          <span key={round.level} className="pz-seq-chip is-landed">
            → {3 ** round.level}
          </span>
        ))}
      </div>
    </div>
  );
}
