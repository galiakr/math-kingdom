import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import CastleBackground from './CastleBackground';
import SceneMap from './scenes/SceneMap';
import SceneTrace from './scenes/SceneTrace';
import SceneBridges from './scenes/SceneBridges';
import ScenePredict from './scenes/ScenePredict';
import SceneBanners from './scenes/SceneBanners';
import type { SceneProps } from './scenes/types';
import './CastleBridges.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  map: SceneMap,
  trace: SceneTrace,
  bridges: SceneBridges,
  predict: ScenePredict,
  banners: SceneBanners,
};

export default function CastleBridges() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // Chronicle pages accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const chronicleBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its chronicle page showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (chronicleBtnRef.current?.contains(target)) return;
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
      title={t('graphs.title')}
      subtitle={t('graphs.subtitle')}
      className="castlebridges"
      theme="theme-castle"
      background={<CastleBackground />}
    >
      <div className="gk-toolbar">
        <div className="gk-dots" role="tablist" aria-label={t('graphs.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`graphs.scenes.${scene.id}.title`)}
                className={`gk-dot${index === flow.sceneIndex ? ' is-active' : ''}${
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
        <div className="gk-toolbar-actions">
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('graphs.buttons.finish') : t('graphs.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={chronicleBtnRef}
            className="gk-chronicle-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            🐉 {t('graphs.buttons.showStory')}
          </button>
        </div>
      </div>

      <div className="gk-stage">
        <section className="gk-scene">
          <h2 className="gk-scene-title">
            {t(`graphs.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="gk-intro-log" ref={introPanelRef}>
            <div className="gk-intro-head">
              <h2 className="gk-intro-title">🐉 {t('graphs.storyTitle')}</h2>
            </div>
            <div className="gk-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`gk-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`graphs.scenes.${scene.id}.intro`)} />
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
              🐉
            </div>
            <h2>{t('graphs.finishedTitle')}</h2>
            <p>{t('graphs.finished')}</p>
            <ul className="gk-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('graphs.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('graphs.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
