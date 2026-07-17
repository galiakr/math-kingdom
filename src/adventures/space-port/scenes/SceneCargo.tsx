import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import { ButtonArt, GlassesArt, MugArt } from '../art';
import type { SceneProps } from './types';
import type { ComponentType } from 'react';

interface CargoRound {
  id: string;
  holes: 0 | 1 | 2;
  emoji?: string;
  Art?: ComponentType<{ size?: number; className?: string }>;
}

// Interleaved; the sock lands after scene 2's dent lesson on purpose.
const ROUNDS: CargoRound[] = [
  { id: 'donut', holes: 1, emoji: '🍩' },
  { id: 'ball', holes: 0, emoji: '⚽' },
  { id: 'scissors', holes: 2, emoji: '✂️' },
  { id: 'banana', holes: 0, emoji: '🍌' },
  { id: 'mug', holes: 1, Art: MugArt },
  { id: 'button', holes: 2, Art: ButtonArt },
  { id: 'sock', holes: 0, emoji: '🧦' },
  { id: 'buoy', holes: 1, emoji: '🛟' },
  { id: 'glasses', holes: 2, Art: GlassesArt },
];

const CRATES = [
  { holes: 0 as const, key: 'zero', rings: 0 },
  { holes: 1 as const, key: 'one', rings: 1 },
  { holes: 2 as const, key: 'two', rings: 2 },
];

/**
 * Scene 3 — the cargo bay: sort items by how many holes go all the way
 * through. Crates are labeled with words + drawn rings, never bare glyphs
 * (digit and letter shapes vary by font).
 */
export default function SceneCargo({ flow }: SceneProps) {
  const { t } = useTranslation();
  const runner = useExerciseRunner<CargoRound, number>(
    ROUNDS,
    (round, holes) => holes === round.holes
  );
  const [crates, setCrates] = useState<Record<number, CargoRound[]>>({ 0: [], 1: [], 2: [] });

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (holes: number) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(holes) === 'correct') {
      setCrates((c) => ({ ...c, [holes]: [...c[holes], runner.round] }));
      window.setTimeout(runner.next, 900);
    }
  };

  const round = runner.round;
  const showRings = !runner.done && runner.attempts >= 2;

  return (
    <div className="tp-body">
      {!runner.done && (
        <>
          <p className="tp-hint">{t('topology.scenes.cargo.prompt')}</p>
          <div className={`tp-cargo-item${showRings ? ' is-ringed' : ''}`}>
            {round.Art ? (
              <round.Art size={110} />
            ) : (
              <span className="tp-cargo-emoji" aria-hidden="true">
                {round.emoji}
              </span>
            )}
            <span className="tp-cargo-name">
              {t(`topology.scenes.cargo.items.${round.id}`)}
            </span>
          </div>
          <div className="tp-crate-row">
            {CRATES.map((crate) => (
              <button
                key={crate.key}
                type="button"
                className="tp-crate"
                disabled={runner.solved}
                onClick={() => answer(crate.holes)}
              >
                <span className="tp-crate-rings" aria-hidden="true">
                  {crate.rings === 0 ? (
                    <span className="tp-ring-none">●</span>
                  ) : (
                    Array.from({ length: crate.rings }, (_, i) => (
                      <span key={i} className="tp-ring" />
                    ))
                  )}
                </span>
                {t(`topology.scenes.cargo.crate.${crate.key}`)}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="tp-feedback" aria-live="polite">
        {runner.done
          ? t('topology.scenes.cargo.done')
          : runner.result === 'correct'
            ? t('topology.scenes.cargo.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('topology.scenes.cargo.retryHint2')
                : t('topology.scenes.cargo.retry')
              : ' '}
      </p>

      <div className="tp-shelves tp-shelves-3">
        {CRATES.map((crate) => (
          <div key={crate.key} className="tp-shelf">
            <h3 className="tp-shelf-title">
              {t(`topology.scenes.cargo.crate.${crate.key}`)}
            </h3>
            <div className="tp-shelf-chips">
              {crates[crate.holes].map((item) => (
                <span key={item.id} className="tp-chip">
                  {item.emoji && <span aria-hidden="true">{item.emoji}</span>}{' '}
                  {t(`topology.scenes.cargo.items.${item.id}`)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
