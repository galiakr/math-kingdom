import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import type { SceneProps } from './types';

interface SumRound {
  id: string;
  prev2: number;
  prev1: number;
  options: number[];
  answer: number;
}

const ROUNDS: SumRound[] = [
  { id: 's5', prev2: 2, prev1: 3, options: [4, 5, 6], answer: 5 },
  { id: 's8', prev2: 3, prev1: 5, options: [7, 8, 9], answer: 8 },
  { id: 's13', prev2: 5, prev1: 8, options: [12, 13, 15], answer: 13 },
  { id: 's21', prev2: 8, prev1: 13, options: [20, 21, 23], answer: 21 },
  { id: 's34', prev2: 13, prev1: 21, options: [32, 34, 35], answer: 34 },
];

const BASE_STRIP = [1, 1, 2, 3];
const NOTES = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];

/**
 * Scene 2 — the addition secret: every Fibonacci number is the last two,
 * added. The strip grows one chip per solved round; the first rounds get
 * countable carrots as training wheels.
 */
export default function SceneSums({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<SumRound, number>(
    ROUNDS,
    (round, answer) => answer === round.answer
  );

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (n: number) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(n) === 'correct') {
      audio.playNote(NOTES[runner.index % NOTES.length]);
      window.setTimeout(runner.next, 900);
    }
  };

  const solvedCount = runner.done ? ROUNDS.length : runner.index + (runner.solved ? 1 : 0);
  const strip = [...BASE_STRIP, ...ROUNDS.slice(0, solvedCount).map((r) => r.answer)];
  const showCarrots = runner.index < 2 && !runner.done;

  return (
    <div className="fib-body">
      {!runner.done && <p className="fib-hint">{t('fibonacci.scenes.sums.prompt')}</p>}

      <div className="fib-strip fib-ltr">
        {strip.map((n, i) => {
          const isLastTwo =
            !runner.done && !runner.solved && i >= strip.length - 2;
          return (
            <span key={i} className={`fib-seq-chip${isLastTwo ? ' is-adding' : ''}`}>
              {n}
            </span>
          );
        })}
        {!runner.done && !runner.solved && <span className="fib-seq-chip is-mystery">?</span>}
      </div>

      {showCarrots && (
        <div className="fib-carrots fib-ltr" aria-hidden="true">
          <span className="fib-carrot-group">{'🥕'.repeat(runner.round.prev2)}</span>
          <span className="fib-plus">+</span>
          <span className="fib-carrot-group">{'🥕'.repeat(runner.round.prev1)}</span>
        </div>
      )}

      {!runner.done && (
        <div className="fib-choices fib-ltr">
          {runner.round.options.map((n) => (
            <button
              key={n}
              type="button"
              className="fib-choice"
              disabled={runner.solved}
              onClick={() => answer(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      <p className="fib-feedback" aria-live="polite">
        {runner.done
          ? t('fibonacci.scenes.sums.done')
          : runner.result === 'correct'
            ? t('fibonacci.scenes.sums.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('fibonacci.scenes.sums.retryHint2')
                : t('fibonacci.scenes.sums.retry')
              : ' '}
        {!runner.done && runner.result === 'retry' && runner.attempts >= 2 && (
          <span className="fib-ltr fib-count-chip">
            {runner.round.prev2} + {runner.round.prev1} = ?
          </span>
        )}
      </p>
    </div>
  );
}
