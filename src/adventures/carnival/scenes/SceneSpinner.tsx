import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import CarnivalWheel from '../CarnivalWheel';
import { CARNIVAL_WHEEL, biggestSector, drawSector, rotationFor } from '../wheel';
import type { SectorId } from '../wheel';
import type { SceneProps } from './types';

const SPINS_TO_LEARN = 3;
const SPIN_MS = 2400;
const TICKS_MS = [150, 550, 1100, 1800];

/**
 * Scene 2 — Pinky's Great Wheel. Pick a color, spin, watch where it lands.
 * Completion is never luck-gated: it takes three spins plus answering the
 * reasoning question (which slice is easiest to land on?).
 */
export default function SceneSpinner({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();

  const [pick, setPick] = useState<SectorId | null>(null);
  const [landed, setLanded] = useState<SectorId | null>(null);
  const [history, setHistory] = useState<SectorId[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [bestAnswer, setBestAnswer] = useState<'correct' | 'retry' | null>(null);

  const spinningRef = useRef(false);
  const pendingRef = useRef(0);
  const rotationRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const spins = history.length;
  const best = biggestSector(CARNIVAL_WHEEL);
  const askReasoning = spins >= 2 && bestAnswer !== 'correct';

  useEffect(() => {
    if (spins >= SPINS_TO_LEARN && bestAnswer === 'correct') flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spins, bestAnswer]);

  useEffect(
    () => () => timersRef.current.forEach((id) => window.clearTimeout(id)),
    []
  );

  const settle = () => {
    // Idempotent: both transitionend and the fallback timer call this.
    if (!spinningRef.current) return;
    spinningRef.current = false;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    const sector = CARNIVAL_WHEEL[pendingRef.current];
    audio.playDrum();
    setSpinning(false);
    setLanded(sector.id);
    setHistory((h) => [...h, sector.id]);
  };
  const settleRef = useRef(settle);
  settleRef.current = settle;

  const spin = () => {
    if (spinningRef.current || !pick) return;
    spinningRef.current = true;
    pendingRef.current = drawSector(CARNIVAL_WHEEL);
    rotationRef.current = rotationFor(CARNIVAL_WHEEL, pendingRef.current, rotationRef.current);
    setLanded(null);
    setRotation(rotationRef.current);
    setSpinning(true);
    // Decelerating ticks — the turning wheel is their visual parallel.
    timersRef.current = TICKS_MS.map((ms) => window.setTimeout(audio.playShaker, ms));
    // transitionend can be swallowed (reduced motion, hidden tab).
    timersRef.current.push(window.setTimeout(() => settleRef.current(), SPIN_MS + 200));
  };

  const matched = landed !== null && landed === pick;
  useEffect(() => {
    if (matched) audio.playTrumpet('C5');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const answerBest = (id: SectorId) => {
    if (id === best.id) {
      audio.playBell();
      setBestAnswer('correct');
    } else {
      setBestAnswer('retry');
    }
  };

  return (
    <div className="cv-body">
      <p className="cv-hint">{t('probability.scenes.spinner.pickPrompt')}</p>

      <div className="cv-pick-row">
        {CARNIVAL_WHEEL.map((sector) => (
          <button
            key={sector.id}
            type="button"
            className={`cv-pick${pick === sector.id ? ' is-picked' : ''}`}
            style={{ borderColor: sector.colorVar }}
            disabled={spinning}
            onClick={() => setPick(sector.id)}
          >
            <span aria-hidden="true">{sector.emoji}</span>{' '}
            {t(`probability.colors.${sector.id}`)}
          </button>
        ))}
      </div>

      <CarnivalWheel
        sectors={CARNIVAL_WHEEL}
        rotation={rotation}
        spinning={spinning}
        onSettle={(e) => {
          if (e.propertyName === 'transform') settle();
        }}
        label={t('probability.scenes.spinner.title')}
        className="cv-wheel-main"
      />

      <div className="controls">
        <button
          type="button"
          className="btn btn-primary"
          disabled={spinning || !pick}
          onClick={spin}
        >
          🎡 {t('probability.buttons.spin')}
        </button>
      </div>

      <p className="cv-feedback" aria-live="polite">
        {spinning
          ? t('probability.scenes.spinner.spinning')
          : landed
            ? matched
              ? t('probability.scenes.spinner.landedMatch')
              : t('probability.scenes.spinner.landedMiss', {
                  color: t(`probability.colors.${landed}`),
                })
            : ' '}
      </p>

      {history.length > 0 && (
        <p className="cv-counter">
          {t('probability.scenes.spinner.spinsLabel')}{' '}
          <span className="cv-ltr cv-history">
            {history.map((id, i) => (
              <span key={i} aria-hidden="true">
                {CARNIVAL_WHEEL.find((s) => s.id === id)?.emoji}
              </span>
            ))}
          </span>
        </p>
      )}

      {askReasoning && !spinning && (
        <div className="cv-question">
          <p className="cv-question-text">{t('probability.scenes.spinner.whichEasiest')}</p>
          <div className="cv-pick-row">
            {CARNIVAL_WHEEL.map((sector) => (
              <button
                key={sector.id}
                type="button"
                className="cv-pick"
                style={{ borderColor: sector.colorVar }}
                onClick={() => answerBest(sector.id)}
              >
                <span aria-hidden="true">{sector.emoji}</span>{' '}
                {t(`probability.colors.${sector.id}`)}
              </button>
            ))}
          </div>
          {bestAnswer === 'retry' && (
            <p className="cv-feedback">{t('probability.scenes.spinner.easyRetry')}</p>
          )}
        </div>
      )}

      {bestAnswer === 'correct' && !flow.sceneDone && (
        <p className="cv-feedback">{t('probability.scenes.spinner.easyCorrect')}</p>
      )}

      {flow.sceneDone && (
        <p className="cv-feedback">{t('probability.scenes.spinner.done')}</p>
      )}
    </div>
  );
}
