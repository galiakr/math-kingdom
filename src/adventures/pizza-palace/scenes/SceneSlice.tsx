import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import FractalPizza from '../FractalPizza';
import { pieceCount } from '../fractal';
import type { SceneProps } from './types';

const TOP_DEPTH = 4;
// A tapped piece sings higher the deeper the slicing has gone.
const DEPTH_NOTES = ['C4', 'E4', 'G4', 'C5', 'E5'];

/**
 * Scene 1 — the magic pizza. One button applies the slicing rule to every
 * triangle at once; watching it repeat three times is the whole goal.
 */
export default function SceneSlice({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    if (depth >= 3) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  const slice = () => {
    audio.playBell();
    setDepth((d) => Math.min(d + 1, TOP_DEPTH));
  };

  return (
    <div className="pz-body">
      <p className="pz-hint">
        {depth === 0
          ? t('fractal.scenes.slice.tapHint')
          : t('fractal.scenes.slice.sliced')}
      </p>

      <FractalPizza
        depth={depth}
        className="pz-pizza-main"
        label={t('fractal.scenes.slice.title')}
        onPieceTap={() => audio.playNote(DEPTH_NOTES[depth])}
      />

      <p className="pz-counter" aria-live="polite">
        {t('fractal.scenes.slice.depthLabel')}{' '}
        <span className="pz-ltr pz-count-chip">{pieceCount(depth)}</span>
      </p>

      <div className="controls">
        <button
          type="button"
          className="btn btn-primary"
          disabled={depth >= TOP_DEPTH}
          onClick={slice}
        >
          🔪 {t('fractal.buttons.slice')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={depth === 0}
          onClick={() => setDepth(0)}
        >
          🍕 {t('fractal.buttons.freshPizza')}
        </button>
      </div>

      {flow.sceneDone && (
        <p className="pz-feedback">{t('fractal.scenes.slice.done')}</p>
      )}
    </div>
  );
}
