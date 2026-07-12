import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import FractalPizza from '../FractalPizza';
import { ROOT, subdivide } from '../fractal';
import type { SceneProps } from './types';

/**
 * Render-only depth: no strokes, no toppings, one static group — so we can
 * afford more polygons than MAX_PIECES, and the finest detail that "pops in"
 * after each re-base sits below what the eye can catch.
 */
const ZOOM_DEPTH = 6;
const ZOOMS_TO_LEARN = 3;
const RISING_NOTES = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];

/** Scaling ×2 about a main vertex maps that corner sub-triangle onto the whole pie. */
const CORNERS = ROOT;
const HOTSPOTS = subdivide(ROOT).slice(0, 3);

const zoomTransform = ([x, y]: readonly [number, number]) =>
  `translate(${x}px, ${y}px) scale(2) translate(${-x}px, ${-y}px)`;

/**
 * Scene 2 — the infinite zoom. Tap a corner slice, ride into it… and land on
 * the exact same pizza. Because the fractal is self-similar, snapping the
 * transform back to identity after the ride is (near) pixel-identical, so the
 * zoom can go on forever with a constant-size DOM.
 */
export default function SceneZoom({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [corner, setCorner] = useState<number | null>(null);
  const [zooms, setZooms] = useState(0);
  const animatingRef = useRef(false);
  const fallbackRef = useRef<number | undefined>(undefined);
  const animating = corner !== null;

  useEffect(() => {
    if (zooms >= ZOOMS_TO_LEARN) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zooms]);

  useEffect(() => () => window.clearTimeout(fallbackRef.current), []);

  const rebase = () => {
    if (!animatingRef.current) return;
    animatingRef.current = false;
    window.clearTimeout(fallbackRef.current);
    audio.playNote(RISING_NOTES[zooms % RISING_NOTES.length]);
    // Dropping the transition class and the transform in one commit snaps
    // back to identity — the "same pizza again" moment.
    setCorner(null);
    setZooms(zooms + 1);
  };

  const zoomInto = (index: number) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    audio.playShaker();
    setCorner(index);
    // transitionend can be swallowed (reduced motion, hidden tab) — a timer
    // runs the same idempotent re-base either way.
    fallbackRef.current = window.setTimeout(rebase, 1000);
  };

  return (
    <div className="pz-body">
      <p className="pz-hint">
        {flow.sceneDone
          ? t('fractal.scenes.zoom.same')
          : t('fractal.scenes.zoom.pickCorner')}
      </p>

      <FractalPizza
        depth={ZOOM_DEPTH}
        toppings={false}
        className="pz-pizza-main pz-pizza-zoom"
        label={t('fractal.scenes.zoom.title')}
        groupClassName={animating ? 'pz-zooming' : ''}
        groupStyle={animating ? { transform: zoomTransform(CORNERS[corner]) } : undefined}
        onGroupTransitionEnd={(e) => {
          if (e.propertyName === 'transform') rebase();
        }}
      >
        {!animating &&
          HOTSPOTS.map((tri, i) => (
            <polygon
              key={i}
              points={tri.map((p) => p.join(',')).join(' ')}
              className="pz-hotspot"
              role="button"
              tabIndex={0}
              aria-label={t('fractal.scenes.zoom.zoomIn')}
              onClick={() => zoomInto(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  zoomInto(i);
                }
              }}
            />
          ))}
      </FractalPizza>

      <p className="pz-counter" aria-live="polite">
        {t('fractal.scenes.zoom.zoomLevel')}{' '}
        <span className="pz-ltr pz-count-chip">🔍 ×{zooms}</span>
      </p>

      {flow.sceneDone && (
        <p className="pz-feedback">{t('fractal.scenes.zoom.done')}</p>
      )}
    </div>
  );
}
