import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import FractalPizza from '../FractalPizza';
import { ROOT, SIERPINSKI, maxDepth, subdivide, survivors } from '../fractal';
import type { Rule } from '../fractal';
import type { SceneProps } from './types';

const SLOTS = subdivide(ROOT);
const DONE_DEPTH = 3;

/**
 * Scene 5 — the fractal chef. Pick which of the four slots keep pizza, then
 * bake the same recipe over and over: a simple rule, repeated, builds a
 * fractal of your own.
 */
export default function SceneChef({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [rule, setRule] = useState<Rule>(SIERPINSKI);
  const [depth, setDepth] = useState(0);

  const top = maxDepth(rule);
  const enoughSlots = survivors(rule) >= 2;
  const fullyBaked = depth >= top;

  useEffect(() => {
    if (depth >= DONE_DEPTH) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  const toggleSlot = (slot: number) => {
    audio.playNote('D4');
    setRule((r) => r.map((keep, i) => (i === slot ? !keep : keep)) as unknown as Rule);
    setDepth(0);
  };

  const bake = () => {
    if (fullyBaked) return;
    const next = depth + 1;
    if (next >= top) audio.playTrumpet();
    else audio.playDrum();
    setDepth(next);
  };

  return (
    <div className="pz-body">
      <p className="pz-hint">
        {enoughSlots ? t('fractal.scenes.chef.ruleHint') : t('fractal.scenes.chef.needTwo')}
      </p>

      <div className="pz-chef-bench">
        <div className="pz-recipe">
          <h3 className="pz-recipe-title">{t('fractal.scenes.chef.recipe')}</h3>
          <svg
            viewBox="0 0 100 87"
            className="pz-recipe-card"
            role="group"
            aria-label={t('fractal.scenes.chef.recipe')}
          >
            {SLOTS.map((tri, slot) => (
              <polygon
                key={slot}
                points={tri.map((p) => p.join(',')).join(' ')}
                className={`pz-slot${rule[slot] ? ' is-kept' : ''}`}
                role="switch"
                aria-checked={rule[slot]}
                aria-label={t(`fractal.scenes.chef.slots.${slot}`)}
                tabIndex={0}
                onClick={() => toggleSlot(slot)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSlot(slot);
                  }
                }}
              />
            ))}
          </svg>
        </div>

        <FractalPizza
          depth={depth}
          rule={rule}
          className={`pz-pizza-oven${fullyBaked ? ' is-fanfare' : ''}`}
          label={t('fractal.scenes.chef.title')}
        />
      </div>

      <div className="controls">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!enoughSlots || fullyBaked}
          onClick={bake}
        >
          🔥 {t('fractal.buttons.bake')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={depth === 0}
          onClick={() => setDepth(0)}
        >
          🍕 {t('fractal.buttons.newRecipe')}
        </button>
      </div>

      <p className="pz-feedback" aria-live="polite">
        {fullyBaked
          ? t('fractal.scenes.chef.fullDepth')
          : flow.sceneDone
            ? t('fractal.scenes.chef.done')
            : ' '}
      </p>
    </div>
  );
}
