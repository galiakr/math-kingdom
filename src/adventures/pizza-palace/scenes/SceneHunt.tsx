import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { useExerciseRunner } from '../../../engine';
import type { SceneProps } from './types';

interface HuntItem {
  id: string;
  emoji: string;
  fractal: boolean;
}

// Interleaved so the child never settles into a yes-yes-yes rhythm.
const ITEMS: HuntItem[] = [
  { id: 'broccoli', emoji: '🥦', fractal: true },
  { id: 'ball', emoji: '⚽', fractal: false },
  { id: 'fern', emoji: '🌿', fractal: true },
  { id: 'banana', emoji: '🍌', fractal: false },
  { id: 'snowflake', emoji: '❄️', fractal: true },
  { id: 'donut', emoji: '🍩', fractal: false },
  { id: 'lightning', emoji: '⚡', fractal: true },
  { id: 'tree', emoji: '🌳', fractal: true },
];

type Basket = 'fractal' | 'plain';

/**
 * Scene 4 — fractal hunters. Sort real-world things by one question: do
 * little copies of the whole hide inside it?
 */
export default function SceneHunt({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const runner = useExerciseRunner<HuntItem, Basket>(
    ITEMS,
    (item, basket) => (basket === 'fractal') === item.fractal
  );
  const [baskets, setBaskets] = useState<Record<Basket, HuntItem[]>>({
    fractal: [],
    plain: [],
  });

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  const answer = (basket: Basket) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(basket) === 'correct') {
      audio.playBell();
      setBaskets((b) => ({ ...b, [basket]: [...b[basket], runner.round] }));
      window.setTimeout(runner.next, 900);
    }
  };

  return (
    <div className="pz-body">
      {!runner.done && (
        <div className="pz-hunt-current">
          <div className="pz-hunt-item">
            <span className="pz-hunt-emoji" aria-hidden="true">
              {runner.round.emoji}
            </span>
            <span className="pz-hunt-name">
              {t(`fractal.scenes.hunt.items.${runner.round.id}`)}
            </span>
          </div>
          <div className="pz-hunt-baskets">
            <button
              type="button"
              className="pz-basket-btn pz-basket-fractal"
              disabled={runner.solved}
              onClick={() => answer('fractal')}
            >
              🔍 {t('fractal.scenes.hunt.fractalBasket')}
            </button>
            <button
              type="button"
              className="pz-basket-btn pz-basket-plain"
              disabled={runner.solved}
              onClick={() => answer('plain')}
            >
              ⬜ {t('fractal.scenes.hunt.plainBasket')}
            </button>
          </div>
        </div>
      )}

      <p className="pz-feedback" aria-live="polite">
        {runner.done
          ? t('fractal.scenes.hunt.done')
          : runner.result === 'correct'
            ? t('fractal.scenes.hunt.correct')
            : runner.result === 'retry'
              ? t('fractal.scenes.hunt.retry')
              : ' '}
      </p>

      <div className="pz-shelves">
        {(['fractal', 'plain'] as const).map((basket) => (
          <div key={basket} className={`pz-shelf pz-shelf-${basket}`}>
            <h3 className="pz-shelf-title">
              {basket === 'fractal' ? '🔍' : '⬜'}{' '}
              {t(`fractal.scenes.hunt.${basket}Basket`)}
            </h3>
            <div className="pz-shelf-chips">
              {baskets[basket].map((item) => (
                <span key={item.id} className="pz-chip">
                  <span aria-hidden="true">{item.emoji}</span>{' '}
                  {t(`fractal.scenes.hunt.items.${item.id}`)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
