import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import CarnivalWheel from '../CarnivalWheel';
import type { WheelSector } from '../wheel';
import type { SceneProps } from './types';

type Verdict = 'fair' | 'rigged';

interface FairRound {
  id: string;
  sectors: WheelSector[];
  fair: boolean;
}

const pink = (weight: number): WheelSector => ({ id: 'pink', weight, colorVar: 'var(--pink)', emoji: '👾' });
const teal = (weight: number): WheelSector => ({ id: 'teal', weight, colorVar: 'var(--teal)', emoji: '🐙' });
const gold = (weight: number): WheelSector => ({ id: 'gold', weight, colorVar: 'var(--gold)', emoji: '🦄' });

// g4 is the one that proves real understanding: a game rigged in YOUR
// favor is still not fair.
const ROUNDS: FairRound[] = [
  { id: 'g1', sectors: [pink(4), teal(4)], fair: true },
  { id: 'g2', sectors: [pink(6), teal(2)], fair: false },
  { id: 'g3', sectors: [teal(5), pink(5)], fair: true },
  { id: 'g4', sectors: [pink(7), teal(1)], fair: false },
  { id: 'g5', sectors: [pink(1), teal(1), gold(1)], fair: true },
];

/**
 * Scene 5 — the child is the Carnival Inspector: stamp each game offer
 * FAIR or RIGGED by comparing every player's slice of the wheel.
 */
export default function SceneFair({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<FairRound, Verdict>(
    ROUNDS,
    (round, verdict) => (verdict === 'fair') === round.fair
  );
  const [stamped, setStamped] = useState<Verdict | null>(null);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const stamp = (verdict: Verdict) => {
    if (runner.solved || runner.done) return;
    audio.playDrum();
    if (runner.submit(verdict) === 'correct') {
      audio.playBell();
      setStamped(verdict);
      window.setTimeout(() => {
        setStamped(null);
        runner.next();
      }, 1100);
    }
  };

  return (
    <div className="cv-body">
      {!runner.done && (
        <>
          <p className="cv-counter">
            {t('probability.scenes.fair.gameLabel')}{' '}
            <span className="cv-ltr cv-count-chip">
              {runner.index + 1} / {runner.total}
            </span>
          </p>

          <div className={`cv-offer${stamped ? ` is-${stamped}` : ''}`}>
            <CarnivalWheel
              sectors={runner.round.sectors}
              label={t('probability.scenes.fair.title')}
              className="cv-wheel-mini"
            />
            <p className="cv-offer-rule">
              {t(`probability.scenes.fair.games.${runner.round.id}`)}
            </p>
            {stamped && (
              <span className="cv-stamp" aria-hidden="true">
                {stamped === 'fair'
                  ? `✅ ${t('probability.scenes.fair.stampFair')}`
                  : `🚫 ${t('probability.scenes.fair.stampRigged')}`}
              </span>
            )}
          </div>

          <div className="cv-pick-row">
            <button
              type="button"
              className="cv-pick cv-pick-fair"
              disabled={runner.solved}
              onClick={() => stamp('fair')}
            >
              ✅ {t('probability.scenes.fair.stampFair')}
            </button>
            <button
              type="button"
              className="cv-pick cv-pick-rigged"
              disabled={runner.solved}
              onClick={() => stamp('rigged')}
            >
              🚫 {t('probability.scenes.fair.stampRigged')}
            </button>
          </div>
        </>
      )}

      <p className="cv-feedback" aria-live="polite">
        {runner.done
          ? t('probability.scenes.fair.done')
          : runner.result === 'correct'
            ? t('probability.scenes.fair.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('probability.scenes.fair.retryHint2')
                : t('probability.scenes.fair.retry')
              : ' '}
      </p>
    </div>
  );
}
