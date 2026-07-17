import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import SpaceBackground from './SpaceBackground';
import SceneRule from './scenes/SceneRule';
import SceneMorph from './scenes/SceneMorph';
import SceneCargo from './scenes/SceneCargo';
import SceneCustoms from './scenes/SceneCustoms';
import SceneLicense from './scenes/SceneLicense';
import type { SceneProps } from './scenes/types';
import './SpacePort.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  rule: SceneRule,
  morph: SceneMorph,
  cargo: SceneCargo,
  customs: SceneCustoms,
  license: SceneLicense,
};

export default function SpacePort() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // Log entries accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const logBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its log entry showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (logBtnRef.current?.contains(target)) return;
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
      title={t('topology.title')}
      subtitle={t('topology.subtitle')}
      className="spaceport"
      theme="theme-space"
      background={<SpaceBackground />}
    >
      <div className="tp-toolbar">
        <div className="tp-dots" role="tablist" aria-label={t('topology.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`topology.scenes.${scene.id}.title`)}
                className={`tp-dot${index === flow.sceneIndex ? ' is-active' : ''}${
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
        <div className="tp-toolbar-actions">
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('topology.buttons.finish') : t('topology.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={logBtnRef}
            className="tp-log-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            🛸 {t('topology.buttons.showStory')}
          </button>
        </div>
      </div>

      <div className="tp-stage">
        <section className="tp-scene">
          <h2 className="tp-scene-title">
            {t(`topology.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="tp-intro-log" ref={introPanelRef}>
            <div className="tp-intro-head">
              <h2 className="tp-intro-title">🛸 {t('topology.storyTitle')}</h2>
            </div>
            <div className="tp-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`tp-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`topology.scenes.${scene.id}.intro`)} />
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
              🐙
            </div>
            <h2>{t('topology.finishedTitle')}</h2>
            <p>{t('topology.finished')}</p>
            <ul className="tp-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('topology.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('topology.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
