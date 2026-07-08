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
                {index + 1}
              </button>
            );
          })}
        </div>
        <MuteButton />
      </div>

      <section className="cf-scene">
        <h2 className="cf-scene-title">
          {t(`primes.scenes.${flow.scene.id}.title`)}
        </h2>
        <div className="cf-scene-intro">
          <StoryText text={t(`primes.scenes.${flow.scene.id}.intro`)} />
        </div>
        <Scene key={flow.scene.id} flow={flow} />
        <div className="controls">
          {flow.sceneDone && !flow.finished && (
            <button type="button" className="btn btn-primary" onClick={flow.advance}>
              {isLast ? t('primes.buttons.finish') : t('primes.buttons.next')}
            </button>
          )}
        </div>
      </section>

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
