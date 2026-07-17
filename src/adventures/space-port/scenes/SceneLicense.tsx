import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import { BlobArt } from '../art';
import type { SceneProps } from './types';

interface LicenseRound {
  id: 'move' | 'holes' | 'same' | 'morph';
  options: string[];
  answer: string;
  ltr?: boolean;
}

// One question from each station of the adventure.
const ROUNDS: LicenseRound[] = [
  { id: 'move', options: ['bend', 'squish', 'cut'], answer: 'cut' },
  { id: 'holes', options: ['0', '1', '2'], answer: '1', ltr: true },
  { id: 'same', options: ['same', 'different'], answer: 'same' },
  { id: 'morph', options: ['mug', 'ball', 'scissors'], answer: 'mug' },
];

/**
 * Scene 5 — the license ceremony: four mixed recap questions, then the
 * official Shape-Shifter License prints itself.
 */
export default function SceneLicense({ flow }: SceneProps) {
  const { t } = useTranslation();
  const runner = useExerciseRunner<LicenseRound, string>(
    ROUNDS,
    (round, option) => option === round.answer
  );

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (option: string) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(option) === 'correct') {
      window.setTimeout(runner.next, 900);
    }
  };

  const round = runner.round;

  return (
    <div className="tp-body">
      {!runner.done && (
        <>
          <p className="tp-hint">👽 {t(`topology.scenes.license.q.${round.id}`)}</p>
          <div className={`tp-choices${round.ltr ? ' tp-ltr' : ''}`}>
            {round.options.map((option) => (
              <button
                key={option}
                type="button"
                className="tp-choice tp-choice-wide"
                disabled={runner.solved}
                onClick={() => answer(option)}
              >
                {round.ltr ? option : t(`topology.scenes.license.options.${option}`)}
              </button>
            ))}
          </div>
          <p className="tp-counter">
            <span className="tp-ltr tp-count-chip">
              {Math.min(runner.index + 1, runner.total)} / {runner.total}
            </span>
          </p>
        </>
      )}

      <p className="tp-feedback" aria-live="polite">
        {runner.done
          ? t('topology.scenes.license.done')
          : runner.result === 'correct'
            ? t('topology.scenes.license.correct')
            : runner.result === 'retry'
              ? t('topology.scenes.license.retry')
              : ' '}
      </p>

      {runner.done && (
        <div className="tp-license">
          <h3 className="tp-license-title">🪪 {t('topology.scenes.license.licenseTitle')}</h3>
          <div className="tp-license-row">
            <BlobArt size={90} className="tp-license-photo" />
            <div className="tp-license-stamps">
              {(['rule', 'morph', 'holes', 'same'] as const).map((key) => (
                <span key={key} className="tp-license-stamp">
                  ✓ {t(`topology.skills.${key}`)}
                </span>
              ))}
            </div>
          </div>
          <p className="tp-license-line">{t('topology.scenes.license.licenseLine')}</p>
        </div>
      )}
    </div>
  );
}
