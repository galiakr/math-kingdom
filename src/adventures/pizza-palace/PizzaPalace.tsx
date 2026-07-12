import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { MuteButton } from '../../audio';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import PalaceBackground from './PalaceBackground';
import SceneSlice from './scenes/SceneSlice';
import SceneZoom from './scenes/SceneZoom';
import SceneCount from './scenes/SceneCount';
import SceneHunt from './scenes/SceneHunt';
import SceneChef from './scenes/SceneChef';
import type { SceneProps } from './scenes/types';
import './PizzaPalace.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  slice: SceneSlice,
  zoom: SceneZoom,
  count: SceneCount,
  hunt: SceneHunt,
  chef: SceneChef,
};

export default function PizzaPalace() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // Recipe-book pages accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const bookBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its recipe page showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (bookBtnRef.current?.contains(target)) return;
      setIntroOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [introOpen]);

  useEffect(() => {
    const log = introLogRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }, [flow.sceneIndex, introOpen]);

  return (
    <AdventureLayout
      title={t('fractal.title')}
      subtitle={t('fractal.subtitle')}
      className="palace"
      theme="theme-pizza"
      background={<PalaceBackground />}
    >
      <div className="pz-toolbar">
        <div className="pz-dots" role="tablist" aria-label={t('fractal.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`fractal.scenes.${scene.id}.title`)}
                className={`pz-dot${index === flow.sceneIndex ? ' is-active' : ''}${
                  flow.isDone(scene.id) ? ' is-done' : ''
                }`}
                disabled={!visitable}
                onClick={() => flow.goTo(index)}
              >
                {flow.isDone(scene.id) && index !== flow.sceneIndex ? '✓' : index + 1}
              </button>
            );
          })}
        </div>
        <div className="pz-toolbar-actions">
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('fractal.buttons.finish') : t('fractal.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={bookBtnRef}
            className="pz-book-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            📖 {t('fractal.buttons.showStory')}
          </button>
          <MuteButton />
        </div>
      </div>

      <div className="pz-stage">
        <section className="pz-scene">
          <h2 className="pz-scene-title">
            {t(`fractal.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="pz-intro-log" ref={introPanelRef}>
            <div className="pz-intro-head">
              <h2 className="pz-intro-title">📖 {t('fractal.storyTitle')}</h2>
            </div>
            <div className="pz-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`pz-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`fractal.scenes.${scene.id}.intro`)} />
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {flow.finished && (
        <div className="finished-overlay" role="dialog" aria-modal="true">
          <div className="finished-panel">
            <div className="finished-emoji" aria-hidden="true">
              🍕
            </div>
            <h2>{t('fractal.finishedTitle')}</h2>
            <p>{t('fractal.finished')}</p>
            <ul className="pz-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('fractal.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('fractal.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
