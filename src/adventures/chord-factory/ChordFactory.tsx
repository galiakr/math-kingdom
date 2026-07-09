import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdventureLayout from '../../components/AdventureLayout';
import StoryText from '../../components/StoryText';
import { MuteButton } from '../../audio';
import { useConceptFlow } from '../../engine';
import { CONCEPT_ID, scenes } from './manifest';
import FactoryBackground from './FactoryBackground';
import SceneSound from './scenes/SceneSound';
import SceneSort from './scenes/SceneSort';
import SceneReveal from './scenes/SceneReveal';
import SceneFactory from './scenes/SceneFactory';
import SceneDetective from './scenes/SceneDetective';
import SceneOrchestra from './scenes/SceneOrchestra';
import type { SceneProps } from './scenes/types';
import './ChordFactory.css';

const SCENE_COMPONENTS: Record<string, ComponentType<SceneProps>> = {
  sound: SceneSound,
  sort: SceneSort,
  reveal: SceneReveal,
  factory: SceneFactory,
  detective: SceneDetective,
  orchestra: SceneOrchestra,
};

export default function ChordFactory() {
  const { t } = useTranslation();
  const flow = useConceptFlow({ conceptId: CONCEPT_ID, scenes });
  const Scene = SCENE_COMPONENTS[flow.scene.id];
  const isLast = flow.sceneIndex === scenes.length - 1;

  const [introOpen, setIntroOpen] = useState(true);
  // The cicada wonder moment floats up between the last scene and the
  // finished screen.
  const [cicadaOpen, setCicadaOpen] = useState(false);
  // Work orders accumulate up to the furthest scene reached, so slow
  // readers can scroll back — revisiting an earlier scene keeps them all.
  const [maxSeen, setMaxSeen] = useState(0);
  const introLogRef = useRef<HTMLDivElement>(null);
  const introPanelRef = useRef<HTMLElement>(null);
  const ordersBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMaxSeen((m) => Math.max(m, flow.sceneIndex));
  }, [flow.sceneIndex]);

  // Every scene opens with its work order showing…
  useEffect(() => {
    setIntroOpen(true);
  }, [flow.sceneIndex]);

  // …and any click outside it (starting to play) folds it away.
  useEffect(() => {
    if (!introOpen) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (introPanelRef.current?.contains(target)) return;
      if (ordersBtnRef.current?.contains(target)) return;
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
      title={t('primes.title')}
      subtitle={t('primes.subtitle')}
      className="factory"
      theme="theme-concert"
      background={<FactoryBackground />}
    >
      <div className="cf-toolbar">
        <div className="cf-dots" role="tablist" aria-label={t('primes.title')}>
          {scenes.map((scene, index) => {
            const visitable = index <= flow.sceneIndex || flow.isDone(scene.id);
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={index === flow.sceneIndex}
                aria-label={t(`primes.scenes.${scene.id}.title`)}
                className={`cf-dot${index === flow.sceneIndex ? ' is-active' : ''}${
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
        <div className="cf-toolbar-actions">
          <div className="controls">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => (isLast ? setCicadaOpen(true) : flow.advance())}
            >
              {isLast ? t('primes.buttons.finish') : t('primes.buttons.next')}
            </button>
          </div>
          <button
            type="button"
            ref={ordersBtnRef}
            className="cf-orders-btn"
            aria-expanded={introOpen}
            onClick={() => setIntroOpen((open) => !open)}
          >
            📋 {t('primes.buttons.showStory')}
          </button>
          <MuteButton />
        </div>
      </div>

      <div className="cf-stage">
        <section className="cf-scene">
          <h2 className="cf-scene-title">
            {t(`primes.scenes.${flow.scene.id}.title`)}
          </h2>
          <Scene key={flow.scene.id} flow={flow} />
        </section>

        {introOpen && (
          <aside className="cf-intro-log" ref={introPanelRef}>
            <div className="cf-intro-head">
              <h2 className="cf-intro-title">📋 {t('primes.storyTitle')}</h2>
            </div>
            <div className="cf-intro-entries" ref={introLogRef}>
              {scenes.slice(0, maxSeen + 1).map((scene, index) => (
                <div
                  key={scene.id}
                  className={`cf-intro-entry${
                    index === flow.sceneIndex ? ' is-current' : ''
                  }`}
                >
                  <StoryText text={t(`primes.scenes.${scene.id}.intro`)} />
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {cicadaOpen && (
        <div className="cf-cicada-veil" role="dialog" aria-modal="true">
          <aside className="cf-cicada-balloon">
            <span className="cf-cicada-emoji" aria-hidden="true">
              🦗
            </span>
            <h3 className="cf-cicada-title">
              {t('primes.scenes.orchestra.cicadaTitle')}
            </h3>
            <p>{t('primes.scenes.orchestra.cicadaText')}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCicadaOpen(false);
                flow.advance();
              }}
            >
              {t('primes.buttons.toFinale')}
            </button>
          </aside>
        </div>
      )}

      {flow.finished && (
        <div className="finished-overlay" role="dialog" aria-modal="true">
          <div className="finished-panel">
            <div className="finished-emoji" aria-hidden="true">
              🎼
            </div>
            <h2>{t('primes.finishedTitle')}</h2>
            <p>{t('primes.finished')}</p>
            <ul className="cf-earned">
              {scenes.map(
                (scene) =>
                  scene.skill && (
                    <li key={scene.skill.id}>✓ {t(scene.skill.titleKey)}</li>
                  )
              )}
            </ul>
            <div className="controls">
              <button type="button" className="btn btn-ghost" onClick={flow.restart}>
                {t('primes.buttons.playAgain')}
              </button>
              <Link to="/" className="btn btn-primary">
                {t('primes.finishedButton')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AdventureLayout>
  );
}
