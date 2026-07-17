import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { MuteButton } from '../../audio';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import GardenBackground from './GardenBackground';
import SceneMonths from './scenes/SceneMonths';
import SceneSums from './scenes/SceneSums';
import SceneSpiral from './scenes/SceneSpiral';
import SceneNature from './scenes/SceneNature';
import type { SceneProps } from './scenes/types';
import './BunnyGarden.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  months: SceneMonths,
  sums: SceneSums,
  spiral: SceneSpiral,
  nature: SceneNature,
};

export default function BunnyGarden() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // Notebook pages accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const notebookBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its notebook page showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (notebookBtnRef.current?.contains(target)) return;
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
      title={t('fibonacci.title')}
      subtitle={t('fibonacci.subtitle')}
      className="garden"
      theme="theme-garden"
      background={<GardenBackground />}
    >
      <div className="fib-toolbar">
        <div className="fib-dots" role="tablist" aria-label={t('fibonacci.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`fibonacci.scenes.${scene.id}.title`)}
                className={`fib-dot${index === flow.sceneIndex ? ' is-active' : ''}${
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
        <div className="fib-toolbar-actions">
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('fibonacci.buttons.finish') : t('fibonacci.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={notebookBtnRef}
            className="fib-notebook-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            🌻 {t('fibonacci.buttons.showStory')}
          </button>
          <MuteButton />
        </div>
      </div>

      <div className="fib-stage">
        <section className="fib-scene">
          <h2 className="fib-scene-title">
            {t(`fibonacci.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="fib-intro-log" ref={introPanelRef}>
            <div className="fib-intro-head">
              <h2 className="fib-intro-title">🌻 {t('fibonacci.storyTitle')}</h2>
            </div>
            <div className="fib-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`fib-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`fibonacci.scenes.${scene.id}.intro`)} />
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
              🐇
            </div>
            <h2>{t('fibonacci.finishedTitle')}</h2>
            <p>{t('fibonacci.finished')}</p>
            <ul className="fib-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('fibonacci.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('fibonacci.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
