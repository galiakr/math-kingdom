import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CarnivalWheel from '../CarnivalWheel';
import TallyChart from '../TallyChart';
import { CARNIVAL_WHEEL, drawSector } from '../wheel';
import type { SectorId } from '../wheel';
import type { SceneProps } from './types';

const SPIN_CAP = 40;
type Phase = 'predict' | 'run' | 'read' | 'done';

/**
 * Scene 4 — Goldie's tally tent. Predict, spin 40 times, and watch the wild
 * early tallies settle into the shape of the wheel. The final question is
 * checked against the actual counts, so luck can never wrong-foot the child.
 */
export default function SceneTally({ flow }: SceneProps) {
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>('predict');
  const [prediction, setPrediction] = useState<SectorId | null>(null);
  const [counts, setCounts] = useState<Record<SectorId, number>>({ pink: 0, teal: 0, gold: 0 });
  const [running, setRunning] = useState(false);
  const [readAnswer, setReadAnswer] = useState<'correct' | 'retry' | null>(null);

  const total = counts.pink + counts.teal + counts.gold;
  const leaders = (Object.keys(counts) as SectorId[]).filter(
    (id) => counts[id] === Math.max(counts.pink, counts.teal, counts.gold)
  );

  // Goldie's fast spins: one draw per tick, drawn outside the updater so
  // StrictMode's double-invoked updaters stay pure.
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const sector = CARNIVAL_WHEEL[drawSector(CARNIVAL_WHEEL)];
      setCounts((prev) => ({ ...prev, [sector.id]: prev[sector.id] + 1 }));
    }, 100);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (total >= SPIN_CAP && phase === 'run') {
      setRunning(false);
      setPhase('read');
    }
  }, [total, phase]);

  const spinOnce = () => {
    if (total >= SPIN_CAP) return;
    const sector = CARNIVAL_WHEEL[drawSector(CARNIVAL_WHEEL)];
    setCounts((prev) => ({ ...prev, [sector.id]: prev[sector.id] + 1 }));
  };

  const answerRead = (id: SectorId) => {
    if (leaders.includes(id)) {
      setReadAnswer('correct');
      setPhase('done');
      flow.completeScene();
    } else {
      setReadAnswer('retry');
    }
  };

  const caption =
    phase === 'predict'
      ? t('probability.scenes.tally.predictPrompt')
      : phase === 'run'
        ? total >= 5 && !leaders.includes('pink')
          ? t('probability.scenes.tally.wildStart')
          : total >= 30
            ? t('probability.scenes.tally.settling')
            : t('probability.scenes.tally.keepSpinning')
        : phase === 'read'
          ? t('probability.scenes.tally.whichWon')
          : t('probability.scenes.tally.matchWheel');

  return (
    <div className="cv-body">
      <p className="cv-hint">{caption}</p>

      {phase === 'predict' && (
        <div className="cv-pick-row">
          {CARNIVAL_WHEEL.map((sector) => (
            <button
              key={sector.id}
              type="button"
              className="cv-pick"
              style={{ borderColor: sector.colorVar }}
              onClick={() => {
                setPrediction(sector.id);
                setPhase('run');
              }}
            >
              <span aria-hidden="true">{sector.emoji}</span>{' '}
              {t(`probability.colors.${sector.id}`)}
            </button>
          ))}
        </div>
      )}

      {phase !== 'predict' && (
        <div className="cv-tally-floor">
          <CarnivalWheel
            sectors={CARNIVAL_WHEEL}
            label={t('probability.scenes.spinner.title')}
            className="cv-wheel-mini"
          />
          <TallyChart
            sectors={CARNIVAL_WHEEL}
            counts={counts}
            showExpected={phase === 'done'}
          />
        </div>
      )}

      {phase === 'run' && (
        <>
          <p className="cv-counter">
            {t('probability.scenes.tally.spinsLabel')}{' '}
            <span className="cv-ltr cv-count-chip">
              {total} / {SPIN_CAP}
            </span>
          </p>
          <div className="controls">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={running}
              onClick={spinOnce}
            >
              🎡 {t('probability.buttons.spinOnce')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setRunning((r) => !r)}
            >
              🦄 {running ? t('probability.buttons.pause') : t('probability.buttons.spinFast')}
            </button>
          </div>
        </>
      )}

      {phase === 'read' && (
        <div className="cv-pick-row">
          {CARNIVAL_WHEEL.map((sector) => (
            <button
              key={sector.id}
              type="button"
              className="cv-pick"
              style={{ borderColor: sector.colorVar }}
              onClick={() => answerRead(sector.id)}
            >
              <span aria-hidden="true">{sector.emoji}</span>{' '}
              {t(`probability.colors.${sector.id}`)}
            </button>
          ))}
        </div>
      )}

      <p className="cv-feedback" aria-live="polite">
        {phase === 'done'
          ? prediction && leaders.includes(prediction)
            ? t('probability.scenes.tally.doneGoodGuess')
            : t('probability.scenes.tally.done')
          : readAnswer === 'retry'
            ? t('probability.scenes.tally.wonRetry')
            : ' '}
      </p>
    </div>
  );
}
