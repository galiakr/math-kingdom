import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import { FIB } from '../fib';
import type { SceneProps } from './types';

interface NatureRound {
  id: string;
  kind: 'count' | 'odd';
  item: string;
  count: number;
  color: string;
  options: number[];
}

const ROUNDS: NatureRound[] = [
  { id: 'lily', kind: 'count', item: 'lily', count: 3, color: 'var(--petal)', options: [2, 3, 4] },
  { id: 'buttercup', kind: 'count', item: 'buttercup', count: 5, color: 'var(--marigold)', options: [4, 5, 6] },
  { id: 'cosmos', kind: 'count', item: 'cosmos', count: 8, color: 'var(--sky-soft)', options: [7, 8, 9] },
  { id: 'pinecone', kind: 'count', item: 'pinecone', count: 8, color: 'var(--earth)', options: [7, 8, 9] },
  { id: 'daisy', kind: 'count', item: 'daisy', count: 13, color: 'var(--panel)', options: [12, 13, 14] },
  { id: 'impostor', kind: 'odd', item: 'impostor', count: 4, color: 'var(--sky-soft)', options: [] },
];

// The odd-one-out lineup: which flower is NOT wearing a Fibonacci number?
const ODD_FLOWERS = [
  { id: 'five', petals: 5, color: 'var(--petal)', fib: true },
  { id: 'four', petals: 4, color: 'var(--sky-soft)', fib: false },
  { id: 'eight', petals: 8, color: 'var(--marigold)', fib: true },
];

const STRIP = FIB.slice(0, 7); // 1 1 2 3 5 8 13

/** A flower with exactly n petals — generated, so the count is honest. */
function Flower({
  petals,
  color,
  highlight,
  size = 150,
}: {
  petals: number;
  color: string;
  highlight?: number;
  size?: number;
}) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className="fib-flower">
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-30"
          rx="11"
          ry="19"
          className={`fib-petal${highlight === i ? ' is-counted' : ''}`}
          style={{ fill: color }}
          transform={`rotate(${(360 / petals) * i} 0 0)`}
        />
      ))}
      <circle cx="0" cy="0" r="13" className="fib-flower-heart" />
    </svg>
  );
}

/**
 * Scene 4 — the garden hunt: count petals and spiral arms, and discover the
 * counts are Fibonacci numbers. "Count with me" pulses the petals one by one
 * so nobody is stuck counting alone.
 */
export default function SceneNature({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<NatureRound, number | string>(ROUNDS, (round, answer) =>
    round.kind === 'count' ? answer === round.count : answer === 'four'
  );
  const [litNumbers, setLitNumbers] = useState<number[]>([]);
  const [countStep, setCountStep] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  useEffect(
    () => () => timersRef.current.forEach((id) => window.clearTimeout(id)),
    []
  );

  const countAlong = () => {
    if (countStep !== null) return;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = Array.from({ length: runner.round.count }, (_, i) =>
      window.setTimeout(() => {
        audio.playShaker();
        setCountStep(i);
      }, i * 550)
    );
    timersRef.current.push(
      window.setTimeout(() => setCountStep(null), runner.round.count * 550 + 600)
    );
  };

  const answer = (value: number | string) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(value) === 'correct') {
      if (runner.round.kind === 'odd') {
        audio.playBell();
      } else {
        audio.playChord(['C4', 'E4', 'G4']);
        setLitNumbers((lit) => [...lit, runner.round.count]);
      }
      window.setTimeout(runner.next, 900);
    }
  };

  const round = runner.round;

  return (
    <div className="fib-body">
      {!runner.done && (
        <p className="fib-hint">
          {round.kind === 'odd'
            ? t('fibonacci.scenes.nature.oddOneOut')
            : round.item === 'pinecone'
              ? t('fibonacci.scenes.nature.countArms')
              : t('fibonacci.scenes.nature.countPetals')}
        </p>
      )}

      {!runner.done && round.kind === 'count' && (
        <>
          <p className="fib-counter">{t(`fibonacci.scenes.nature.items.${round.item}`)}</p>
          <Flower petals={round.count} color={round.color} highlight={countStep ?? undefined} />
          <div className="controls">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={countStep !== null}
              onClick={countAlong}
            >
              🔢 {t('fibonacci.buttons.countAlong')}
            </button>
          </div>
          <div className="fib-choices fib-ltr">
            {round.options.map((n) => (
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
        </>
      )}

      {!runner.done && round.kind === 'odd' && (
        <div className="fib-odd-row">
          {ODD_FLOWERS.map((flower) => (
            <button
              key={flower.id}
              type="button"
              className={`fib-odd-btn${
                runner.solved && !flower.fib ? ' is-impostor' : ''
              }`}
              disabled={runner.solved}
              aria-label={t(`fibonacci.scenes.nature.petals`, { n: flower.petals })}
              onClick={() => answer(flower.id)}
            >
              <Flower petals={flower.petals} color={flower.color} size={110} />
            </button>
          ))}
        </div>
      )}

      <p className="fib-feedback" aria-live="polite">
        {runner.done
          ? t('fibonacci.scenes.nature.done')
          : runner.result === 'correct'
            ? round.kind === 'odd'
              ? t('fibonacci.scenes.nature.notFib')
              : t('fibonacci.scenes.nature.correct')
            : runner.result === 'retry'
              ? t('fibonacci.scenes.nature.retry')
              : ' '}
      </p>

      <div className="fib-strip fib-ltr" aria-label={t('fibonacci.scenes.nature.title')}>
        {STRIP.map((n, i) => (
          <span key={i} className={`fib-seq-chip${litNumbers.includes(n) ? ' is-lit' : ''}`}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
