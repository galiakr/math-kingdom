import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import ChordBlocks from '../ChordBlocks';
import { FACTORY_PRIMES, colorOf, notesOfFactors, primeFactors } from '../primes';
import type { SceneProps } from './types';

const TRAY_MAX = 4;
const GOAL = 3;

/**
 * Scene 4 — the direction reverses: the child builds numbers by mixing prime
 * notes. 2 + 3 → 6 and its chord; 2 + 2 + 3 → 12. The fundamental theorem of
 * arithmetic, played rather than stated.
 */
export default function SceneFactory({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [tray, setTray] = useState<number[]>([]);
  const [built, setBuilt] = useState<readonly number[]>([]);

  const product = tray.reduce((a, b) => a * b, 1);

  const addPrime = (prime: number) => {
    if (tray.length >= TRAY_MAX) return;
    const next = [...tray, prime].sort((a, b) => a - b);
    setTray(next);
    audio.playChord(notesOfFactors(next));
    if (next.length >= 2) {
      const prod = next.reduce((a, b) => a * b, 1);
      const collection = built.includes(prod) ? built : [...built, prod];
      setBuilt(collection);
      if (collection.length >= GOAL) flow.completeScene();
    }
  };

  return (
    <div className="cf-body">
      <div className="cf-prime-family cf-prime-family-compact">
        {FACTORY_PRIMES.map((prime) => (
          <button
            key={prime}
            type="button"
            className="prime-card prime-card-small"
            style={{ '--prime-color': colorOf(prime) } as React.CSSProperties}
            disabled={tray.length >= TRAY_MAX}
            onClick={() => addPrime(prime)}
          >
            <span className="prime-card-number">{prime}</span>
          </button>
        ))}
      </div>

      <div className="cf-machine">
        {tray.length === 0 ? (
          <p className="cf-hint">{t('primes.scenes.factory.empty')}</p>
        ) : (
          <>
            <div className="cf-machine-out">
              <ChordBlocks factors={tray} />
              <span className="cf-machine-equals" aria-hidden="true">
                {tray.join(' × ')} =
              </span>
              <span className="cf-machine-number">{product}</span>
            </div>
            <div className="cf-machine-controls">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => audio.playChord(notesOfFactors(tray))}
              >
                🔊 {t('primes.buttons.listen')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setTray([])}
              >
                {t('primes.buttons.clear')}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="cf-collection">
        <h3 className="cf-collection-title">
          {t('primes.scenes.factory.built')} ({built.length}/{GOAL})
        </h3>
        <div className="cf-basket-chips">
          {built.map((n) => (
            <span key={n} className="cf-chip">
              {n} <ChordBlocks factors={primeFactors(n)} small />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
