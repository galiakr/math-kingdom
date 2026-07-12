import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { MuteButton } from '../../audio';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import CarnivalBackground from './CarnivalBackground';
import SceneBooths from './scenes/SceneBooths';
import SceneSpinner from './scenes/SceneSpinner';
import SceneEggs from './scenes/SceneEggs';
import SceneTally from './scenes/SceneTally';
import SceneFair from './scenes/SceneFair';
import type { SceneProps } from './scenes/types';
import './ProbabilityCarnival.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  booths: SceneBooths,
  spinner: SceneSpinner,
  eggs: SceneEggs,
  tally: SceneTally,
  fair: SceneFair,
};

export default function ProbabilityCarnival() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // Ticket stubs accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const ticketBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its ticket showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (ticketBtnRef.current?.contains(target)) return;
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
      title={t('probability.title')}
      subtitle={t('probability.subtitle')}
      className="carnival"
      theme="theme-carnival"
      background={<CarnivalBackground />}
    >
      <div className="cv-toolbar">
        <div className="cv-dots" role="tablist" aria-label={t('probability.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`probability.scenes.${scene.id}.title`)}
                className={`cv-dot${index === flow.sceneIndex ? ' is-active' : ''}${
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
        <div className="cv-toolbar-actions">
          <div className="controls">
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('probability.buttons.finish') : t('probability.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={ticketBtnRef}
            className="cv-ticket-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            🎟️ {t('probability.buttons.showStory')}
          </button>
          <MuteButton />
        </div>
      </div>

      <div className="cv-stage">
        <section className="cv-scene">
          <h2 className="cv-scene-title">
            {t(`probability.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="cv-intro-log" ref={introPanelRef}>
            <div className="cv-intro-head">
              <h2 className="cv-intro-title">🎟️ {t('probability.storyTitle')}</h2>
            </div>
            <div className="cv-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`cv-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`probability.scenes.${scene.id}.intro`)} />
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
              🎪
            </div>
            <h2>{t('probability.finishedTitle')}</h2>
            <p>{t('probability.finished')}</p>
            <ul className="cv-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('probability.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('probability.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
