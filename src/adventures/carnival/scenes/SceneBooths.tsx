import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import type { SceneProps } from './types';

type Likelihood = 'impossible' | 'maybe' | 'certain';

interface BoothRound {
  id: string;
  emoji: string;
  answer: Likelihood;
}

// Interleaved so no booth gets a winning streak.
const ROUNDS: BoothRound[] = [
  { id: 'sun', emoji: '🌅', answer: 'certain' },
  { id: 'dragon', emoji: '🐉', answer: 'impossible' },
  { id: 'rain', emoji: '🌧️', answer: 'maybe' },
  { id: 'sevenDie', emoji: '🎲', answer: 'impossible' },
  { id: 'pinkSpin', emoji: '🎡', answer: 'maybe' },
  { id: 'saturday', emoji: '📅', answer: 'certain' },
  { id: 'friend', emoji: '🤝', answer: 'maybe' },
  { id: 'catTalks', emoji: '🐱', answer: 'impossible' },
];

const BOOTHS: { id: Likelihood; emoji: string }[] = [
  { id: 'impossible', emoji: '🙀' },
  { id: 'maybe', emoji: '🤔' },
  { id: 'certain', emoji: '😺' },
];

/**
 * Scene 1 — the carnival gate. The monsters hold up event cards; the child
 * files each one into the right booth: no way / maybe / for sure.
 */
export default function SceneBooths({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<BoothRound, Likelihood>(
    ROUNDS,
    (round, booth) => booth === round.answer
  );
  const [shelves, setShelves] = useState<Record<Likelihood, BoothRound[]>>({
    impossible: [],
    maybe: [],
    certain: [],
  });

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (booth: Likelihood) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(booth) === 'correct') {
      audio.playBell();
      setShelves((s) => ({ ...s, [booth]: [...s[booth], runner.round] }));
      window.setTimeout(runner.next, 900);
    }
  };

  return (
    <div className="cv-body">
      {!runner.done && (
        <>
          <div className="cv-card">
            <span className="cv-card-emoji" aria-hidden="true">
              {runner.round.emoji}
            </span>
            <span className="cv-card-text">
              {t(`probability.scenes.booths.events.${runner.round.id}`)}
            </span>
          </div>
          <div className="cv-booth-row">
            {BOOTHS.map((booth) => (
              <button
                key={booth.id}
                type="button"
                className={`cv-booth cv-booth-${booth.id}`}
                disabled={runner.solved}
                onClick={() => answer(booth.id)}
              >
                <span aria-hidden="true">{booth.emoji}</span>{' '}
                {t(`probability.scenes.booths.booth.${booth.id}`)}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="cv-feedback" aria-live="polite">
        {runner.done
          ? t('probability.scenes.booths.done')
          : runner.result === 'correct'
            ? t('probability.scenes.booths.correct')
            : runner.result === 'retry'
              ? t('probability.scenes.booths.retry')
              : ' '}
      </p>

      <div className="cv-shelves">
        {BOOTHS.map((booth) => (
          <div key={booth.id} className="cv-shelf">
            <h3 className="cv-shelf-title">
              <span aria-hidden="true">{booth.emoji}</span>{' '}
              {t(`probability.scenes.booths.booth.${booth.id}`)}
            </h3>
            <div className="cv-shelf-chips">
              {shelves[booth.id].map((round) => (
                <span key={round.id} className="cv-chip">
                  <span aria-hidden="true">{round.emoji}</span>{' '}
                  {t(`probability.scenes.booths.events.${round.id}`)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
