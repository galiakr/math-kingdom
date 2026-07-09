import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { FACTORY_PRIMES, PRIME_VOICES, colorOf, noteOf } from '../primes';
import type { SceneProps } from './types';

const noteLabel = (prime: number) => PRIME_VOICES[prime].note.replace('b', '♭');
const GOAL = 3;

/**
 * Scene 3 — the reveal: the solo singers are called prime numbers. Meet the
 * family, each with its fixed note and color. The goal (and the skill) is
 * earned by actually listening: tap a few primes, don't just pass through.
 */
export default function SceneReveal({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [heard, setHeard] = useState<readonly number[]>([]);

  const listen = (prime: number) => {
    audio.playNote(noteOf(prime));
    const next = heard.includes(prime) ? heard : [...heard, prime];
    setHeard(next);
    if (next.length >= GOAL) flow.completeScene();
  };

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
            className={`prime-card${heard.includes(prime) ? ' is-heard' : ''}`}
            style={{ '--prime-color': colorOf(prime) } as React.CSSProperties}
            onClick={() => listen(prime)}
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
