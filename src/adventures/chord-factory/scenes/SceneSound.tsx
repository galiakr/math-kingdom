import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import ChordBlocks from '../ChordBlocks';
import { chordOf, primeFactors } from '../primes';
import type { SceneProps } from './types';

const PAD_NUMBERS = Array.from({ length: 19 }, (_, i) => i + 2);
const GOAL = 4;

/**
 * Scene 1 — pure exploration, no explanation: press numbers, hear (and see)
 * their sounds. Opens with the "turn on the factory" button, which is also
 * the user gesture browsers require before any audio.
 */
export default function SceneSound({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [tried, setTried] = useState<readonly number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);

  if (!audio.ready) {
    return (
      <div className="cf-power">
        <button
          type="button"
          className="btn btn-primary cf-power-btn"
          onClick={() => void audio.start()}
        >
          🎛️ {t('primes.buttons.powerOn')}
        </button>
        <p className="cf-hint">{t('primes.scenes.sound.powerHint')}</p>
      </div>
    );
  }

  const press = (n: number) => {
    audio.playChord(chordOf(n));
    setCurrent(n);
    const next = tried.includes(n) ? tried : [...tried, n];
    setTried(next);
    if (next.length >= GOAL) flow.completeScene();
  };

  return (
    <div className="cf-body">
      <div className="cf-stage-row">
        <div className="number-pad">
          {PAD_NUMBERS.map((n) => (
            <button
              key={n}
              type="button"
              className={`pad-key${tried.includes(n) ? ' is-tried' : ''}${
                current === n ? ' is-current' : ''
              }`}
              onClick={() => press(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="cf-listen" aria-live="polite">
          {current !== null ? (
            <>
              <div className="cf-listen-number">{current}</div>
              <ChordBlocks factors={primeFactors(current)} />
            </>
          ) : (
            <p className="cf-hint">{t('primes.scenes.sound.tryOne')}</p>
          )}
        </div>
      </div>
      <p className="cf-progress-hint">
        {t('primes.scenes.sound.tried', { n: tried.length })}
      </p>
    </div>
  );
}
