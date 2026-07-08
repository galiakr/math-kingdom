import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { FACTORY_PRIMES, PRIME_VOICES, colorOf, noteOf } from '../primes';
import type { SceneProps } from './types';

const noteLabel = (prime: number) => PRIME_VOICES[prime].note.replace('b', '♭');

/**
 * Scene 3 — the reveal: the solo singers are called prime numbers. Meet the
 * family, each with its fixed note and color. Expository, so the way forward
 * opens immediately.
 */
export default function SceneReveal({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();

  const { completeScene } = flow;
  useEffect(() => {
    completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cf-body">
      <blockquote className="cf-key-sentence">
        {t('primes.scenes.reveal.keySentence')}
      </blockquote>
      <div className="cf-prime-family">
        {FACTORY_PRIMES.map((prime) => (
          <button
            key={prime}
            type="button"
            className="prime-card"
            style={{ '--prime-color': colorOf(prime) } as React.CSSProperties}
            onClick={() => audio.playNote(noteOf(prime))}
          >
            <span className="prime-card-number">{prime}</span>
            <span className="prime-card-note">♪ {noteLabel(prime)}</span>
          </button>
        ))}
      </div>
      <p className="cf-hint">{t('primes.scenes.reveal.tapHint')}</p>
    </div>
  );
}
