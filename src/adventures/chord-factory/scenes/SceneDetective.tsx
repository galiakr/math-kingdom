import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import ChordBlocks from '../ChordBlocks';
import { FACTORY_PRIMES, chordOf, colorOf, notesOfFactors, primeFactors } from '../primes';
import type { SceneProps } from './types';

// Two notes first, three notes (and a repeat) later.
const MYSTERIES = [6, 10, 15, 12, 30];
const GUESS_MAX = 4;

const sameFactors = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * Scene 5 — the detective exercise: the factory plays a mystery chord and the
 * child guesses which prime notes are inside. The gray mystery blocks always
 * show how many notes are hiding; "show the colors" is the no-penalty visual
 * channel for anyone who can't play by ear.
 */
export default function SceneDetective({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<number, number[]>(MYSTERIES, (n, guess) =>
    sameFactors(primeFactors(n), guess)
  );
  const [guess, setGuess] = useState<number[]>([]);
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  if (runner.done) {
    return (
      <div className="cf-body">
        <div className="cf-badge" role="status">
          <span className="cf-badge-emoji" aria-hidden="true">
            🕵️🎼
          </span>
          <h3 className="cf-badge-title">{t('primes.scenes.detective.badgeTitle')}</h3>
          <p>{t('primes.scenes.detective.badgeText')}</p>
        </div>
      </div>
    );
  }

  const addPrime = (prime: number) => {
    if (runner.solved || guess.length >= GUESS_MAX) return;
    setGuess([...guess, prime].sort((a, b) => a - b));
  };

  const check = () => {
    if (guess.length === 0 || runner.solved) return;
    if (runner.submit(guess) === 'correct') {
      audio.playChord(chordOf(runner.round));
      window.setTimeout(() => {
        setGuess([]);
        setShowColors(false);
        runner.next();
      }, 1400);
    }
  };

  return (
    <div className="cf-body">
      <p className="cf-progress-hint">
        {t('primes.scenes.detective.mystery', { n: runner.index + 1, total: runner.total })}
      </p>

      <div className="cf-mystery">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => audio.playChord(chordOf(runner.round))}
        >
          🔊 {t('primes.scenes.detective.playMystery')}
        </button>
        <div className="cf-mystery-blocks">
          <ChordBlocks
            factors={primeFactors(runner.round)}
            mystery={!showColors && !runner.solved}
          />
        </div>
        {!showColors && !runner.solved && (
          <button type="button" className="btn btn-ghost" onClick={() => setShowColors(true)}>
            🎨 {t('primes.buttons.hint')}
          </button>
        )}
      </div>

      <div className="cf-prime-family cf-prime-family-compact">
        {FACTORY_PRIMES.map((prime) => (
          <button
            key={prime}
            type="button"
            className="prime-card prime-card-small"
            style={{ '--prime-color': colorOf(prime) } as React.CSSProperties}
            disabled={runner.solved || guess.length >= GUESS_MAX}
            onClick={() => addPrime(prime)}
          >
            <span className="prime-card-number">{prime}</span>
          </button>
        ))}
      </div>

      <div className="cf-guess">
        <h3 className="cf-collection-title">{t('primes.scenes.detective.yourGuess')}</h3>
        {guess.length === 0 ? (
          <p className="cf-hint">{t('primes.scenes.detective.emptyGuess')}</p>
        ) : (
          <div className="cf-guess-row">
            <button
              type="button"
              className="cf-guess-blocks"
              aria-label={t('primes.buttons.listen')}
              onClick={() => audio.playChord(notesOfFactors(guess))}
            >
              <ChordBlocks factors={guess} />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setGuess([])}>
              {t('primes.buttons.clear')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={runner.solved}
              onClick={check}
            >
              {t('primes.buttons.check')}
            </button>
          </div>
        )}
      </div>

      <p className="cf-feedback" aria-live="polite">
        {runner.solved
          ? t('primes.scenes.detective.correct', { n: runner.round })
          : runner.result === 'retry'
            ? runner.attempts >= 2 && !showColors
              ? t('primes.scenes.detective.hintUnlocked')
              : t('primes.scenes.detective.retry')
            : ' '}
      </p>
    </div>
  );
}
