import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import ChordBlocks from '../ChordBlocks';
import { chordOf, isPrime, primeFactors } from '../primes';
import type { SceneProps } from './types';

// 8 then 7 first — the guided contrast from the intro text.
const SORT_NUMBERS = [8, 7, 6, 11, 9, 5, 12, 13];
type Basket = 'rich' | 'solo';

/**
 * Scene 2 — sort numbers into "rich sounds" vs "solo sounds" by ear (or by
 * block stack). The child discovers that some numbers just won't make a
 * chord; unlimited gentle retries.
 */
export default function SceneSort({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<number, Basket>(
    SORT_NUMBERS,
    (n, basket) => (basket === 'solo') === isPrime(n)
  );
  const [baskets, setBaskets] = useState<Record<Basket, number[]>>({
    rich: [],
    solo: [],
  });

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (basket: Basket) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(basket) === 'correct') {
      audio.playChord(chordOf(runner.round));
      setBaskets((b) => ({ ...b, [basket]: [...b[basket], runner.round] }));
      window.setTimeout(runner.next, 900);
    }
  };

  return (
    <div className="cf-body">
      {!runner.done && (
        <div className="cf-sort-current">
          <button
            type="button"
            className="cf-sort-number"
            onClick={() => audio.playChord(chordOf(runner.round))}
          >
            <span className="cf-sort-digits">{runner.round}</span>
            <span className="cf-sort-play">🔊 {t('primes.scenes.sort.listen')}</span>
          </button>
          <div className="cf-sort-baskets">
            <button
              type="button"
              className="basket-btn basket-rich"
              disabled={runner.solved}
              onClick={() => answer('rich')}
            >
              🎶 {t('primes.scenes.sort.rich')}
            </button>
            <button
              type="button"
              className="basket-btn basket-solo"
              disabled={runner.solved}
              onClick={() => answer('solo')}
            >
              🎵 {t('primes.scenes.sort.solo')}
            </button>
          </div>
        </div>
      )}

      <p className="cf-feedback" aria-live="polite">
        {runner.done
          ? t('primes.scenes.sort.done')
          : runner.result === 'correct'
            ? t('primes.scenes.sort.correct')
            : runner.result === 'retry'
              ? t('primes.scenes.sort.retry')
              : ' '}
      </p>

      <div className="cf-baskets">
        {(['rich', 'solo'] as const).map((basket) => (
          <div key={basket} className={`cf-basket cf-basket-${basket}`}>
            <h3 className="cf-basket-title">
              {basket === 'rich' ? '🎶' : '🎵'} {t(`primes.scenes.sort.${basket}`)}
            </h3>
            <div className="cf-basket-chips">
              {baskets[basket].map((n) => (
                <span key={n} className="cf-chip">
                  {n} <ChordBlocks factors={primeFactors(n)} small />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
