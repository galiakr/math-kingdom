import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import type { SceneProps } from './types';

type EggColor = 'pink' | 'teal' | 'gold';
type Jar = Record<EggColor, number>;

interface EggRound {
  id: string;
  jar: Jar;
  questionKey: 'most' | 'least' | 'compare' | 'canGold';
  options: string[];
  answer: string;
}

const ROUNDS: EggRound[] = [
  { id: 'r1', jar: { pink: 7, teal: 2, gold: 1 }, questionKey: 'most', options: ['pink', 'teal', 'gold'], answer: 'pink' },
  { id: 'r2', jar: { pink: 7, teal: 2, gold: 1 }, questionKey: 'least', options: ['pink', 'teal', 'gold'], answer: 'gold' },
  { id: 'r3', jar: { pink: 4, teal: 4, gold: 2 }, questionKey: 'compare', options: ['pink', 'teal', 'equal'], answer: 'equal' },
  { id: 'r4', jar: { pink: 2, teal: 3, gold: 0 }, questionKey: 'canGold', options: ['yes', 'no'], answer: 'no' },
  { id: 'r5', jar: { pink: 1, teal: 3, gold: 6 }, questionKey: 'most', options: ['pink', 'teal', 'gold'], answer: 'gold' },
  { id: 'r6', jar: { pink: 6, teal: 1, gold: 5 }, questionKey: 'least', options: ['pink', 'teal', 'gold'], answer: 'teal' },
];

const EGG_VARS: Record<EggColor, string> = {
  pink: 'var(--pink)',
  teal: 'var(--teal)',
  gold: 'var(--gold)',
};

// Up to 12 eggs, filled bottom row first — grouped by color so they're countable.
const SPOTS = Array.from({ length: 12 }, (_, i) => ({
  x: 22 + (i % 4) * 19,
  y: 72 - Math.floor(i / 4) * 18,
}));

const NOTES = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];

const jarEggs = (jar: Jar): EggColor[] =>
  (['pink', 'teal', 'gold'] as const).flatMap((color) => Array(jar[color]).fill(color));

/** Weighted draw from the jar — pure celebration, never checked. */
const dispense = (jar: Jar): EggColor => {
  const eggs = jarEggs(jar);
  return eggs[Math.floor(Math.random() * eggs.length)];
};

/**
 * Scene 3 — Marina's egg machine. Countable eggs behind glass; the child
 * compares chances by comparing counts. Every correct answer pops one real
 * (random) egg out of the machine as a reward.
 */
export default function SceneEggs({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<EggRound, string>(
    ROUNDS,
    (round, answer) => answer === round.answer
  );
  const [collected, setCollected] = useState<EggColor[]>([]);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (option: string) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(option) === 'correct') {
      const egg = dispense(runner.round.jar);
      audio.playNote(NOTES[collected.length % NOTES.length]);
      setCollected((c) => [...c, egg]);
      window.setTimeout(runner.next, 900);
    }
  };

  const eggs = jarEggs(runner.round.jar);

  return (
    <div className="cv-body">
      {!runner.done && (
        <p className="cv-hint">
          {t(`probability.scenes.eggs.questions.${runner.round.questionKey}`)}
        </p>
      )}

      <svg
        viewBox="0 0 100 90"
        className="cv-jar cv-ltr"
        role="img"
        aria-label={t('probability.scenes.eggs.title')}
      >
        <path
          d="M30,6 h40 v6 h-6 q16,6 16,22 v34 q0,16 -16,16 h-28 q-16,0 -16,-16 v-34 q0,-16 16,-22 h-6 z"
          className="cv-jar-glass"
        />
        {eggs.map((color, i) => (
          <ellipse
            key={`${runner.round.id}-${i}`}
            cx={SPOTS[i].x}
            cy={SPOTS[i].y}
            rx="8"
            ry="9.5"
            className="cv-egg"
            style={{ fill: EGG_VARS[color] }}
          />
        ))}
      </svg>

      {!runner.done && (
        <div className="cv-pick-row">
          {runner.round.options.map((option) => (
            <button
              key={option}
              type="button"
              className="cv-pick"
              style={
                option in EGG_VARS
                  ? { borderColor: EGG_VARS[option as EggColor] }
                  : undefined
              }
              disabled={runner.solved}
              onClick={() => answer(option)}
            >
              {option in EGG_VARS ? (
                <>
                  <span className="cv-egg-dot" style={{ background: EGG_VARS[option as EggColor] }} />{' '}
                  {t(`probability.colors.${option}`)}
                </>
              ) : (
                t(`probability.scenes.eggs.options.${option}`)
              )}
            </button>
          ))}
        </div>
      )}

      <p className="cv-feedback" aria-live="polite">
        {runner.done
          ? t('probability.scenes.eggs.done')
          : runner.result === 'correct'
            ? t('probability.scenes.eggs.correct')
            : runner.result === 'retry'
              ? t('probability.scenes.eggs.retry')
              : ' '}
      </p>

      {collected.length > 0 && (
        <p className="cv-counter">
          {t('probability.scenes.eggs.dispensed')}{' '}
          <span className="cv-ltr cv-history">
            {collected.map((color, i) => (
              <span key={i} className="cv-egg-dot" style={{ background: EGG_VARS[color] }} />
            ))}
          </span>
        </p>
      )}
    </div>
  );
}
