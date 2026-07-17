import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import { ButtonArt, GlassesArt, MugArt } from '../art';
import type { SceneProps } from './types';
import type { ComponentType } from 'react';

interface PairItem {
  id: string;
  holes: number;
  emoji?: string;
  Art?: ComponentType<{ size?: number; className?: string }>;
}

interface PairRound {
  id: string;
  a: PairItem;
  b: PairItem;
  same: boolean;
}

const mug: PairItem = { id: 'mug', holes: 1, Art: MugArt };
const glasses: PairItem = { id: 'glasses', holes: 2, Art: GlassesArt };
const buttonItem: PairItem = { id: 'button', holes: 2, Art: ButtonArt };

const ROUNDS: PairRound[] = [
  { id: 'p1', a: mug, b: { id: 'donut', holes: 1, emoji: '🍩' }, same: true },
  { id: 'p2', a: { id: 'ball', holes: 0, emoji: '⚽' }, b: { id: 'donut', holes: 1, emoji: '🍩' }, same: false },
  { id: 'p3', a: { id: 'banana', holes: 0, emoji: '🍌' }, b: { id: 'ball', holes: 0, emoji: '⚽' }, same: true },
  { id: 'p4', a: { id: 'scissors', holes: 2, emoji: '✂️' }, b: glasses, same: true },
  { id: 'p5', a: { id: 'ring', holes: 1, emoji: '💍' }, b: buttonItem, same: false },
  { id: 'p6', a: { id: 'sock', holes: 0, emoji: '🧦' }, b: { id: 'donut', holes: 1, emoji: '🍩' }, same: false },
];

function PairSide({ item, badge }: { item: PairItem; badge: boolean }) {
  return (
    <div className="tp-pair-side">
      {item.Art ? (
        <item.Art size={92} />
      ) : (
        <span className="tp-pair-emoji" aria-hidden="true">
          {item.emoji}
        </span>
      )}
      {badge && <span className="tp-hole-badge tp-ltr">{item.holes}</span>}
    </div>
  );
}

/**
 * Scene 4 — alien customs: same shape ⇔ same number of holes. Each verdict
 * lands as a stamped roundel on the pair card — the visual "thunk".
 */
export default function SceneCustoms({ flow }: SceneProps) {
  const { t } = useTranslation();
  const runner = useExerciseRunner<PairRound, boolean>(
    ROUNDS,
    (round, same) => same === round.same
  );
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (same: boolean) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(same) === 'correct') {
      setStamped(true);
      window.setTimeout(() => {
        setStamped(false);
        runner.next();
      }, 1100);
    }
  };

  const round = runner.round;
  const showBadges = !runner.done && runner.attempts >= 2;

  return (
    <div className="tp-body">
      {!runner.done && (
        <>
          <p className="tp-hint">
            🤖 {t('topology.scenes.customs.prompt')}
          </p>
          <div className="tp-pair-card">
            <PairSide item={round.a} badge={showBadges} />
            <span className="tp-pair-vs" aria-hidden="true">
              ⇄
            </span>
            <PairSide item={round.b} badge={showBadges} />
            {stamped && (
              <span
                className={`tp-stamp ${round.same ? 'tp-stamp-same' : 'tp-stamp-diff'}`}
                aria-hidden="true"
              >
                {round.same
                  ? t('topology.scenes.customs.stampSame')
                  : t('topology.scenes.customs.stampDiff')}
              </span>
            )}
          </div>
          <div className="tp-verdict-row">
            <button
              type="button"
              className="tp-verdict tp-verdict-yes"
              disabled={runner.solved}
              onClick={() => answer(true)}
            >
              ≈ {t('topology.scenes.customs.same')}
            </button>
            <button
              type="button"
              className="tp-verdict tp-verdict-no"
              disabled={runner.solved}
              onClick={() => answer(false)}
            >
              ≠ {t('topology.scenes.customs.different')}
            </button>
          </div>
        </>
      )}

      <p className="tp-feedback" aria-live="polite">
        {runner.done
          ? t('topology.scenes.customs.done')
          : runner.result === 'correct'
            ? t('topology.scenes.customs.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('topology.scenes.customs.retryHint2')
                : t('topology.scenes.customs.retry')
              : ' '}
      </p>

      <p className="tp-counter">
        <span className="tp-ltr tp-count-chip">
          {Math.min(runner.index + 1, runner.total)} / {runner.total}
        </span>
      </p>
    </div>
  );
}
