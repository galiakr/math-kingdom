import { useCallback, useState } from 'react';
import { markCompleted } from '../progress';
import { unlockSkill } from '../skills';
import type { SceneDef } from '../adventures/types';

export interface ConceptFlowOptions {
  /** The adventure id recorded in progress when the arc finishes. */
  conceptId: string;
  /** The concept's scenes in play order (the adventure's manifest). */
  scenes: SceneDef[];
}

export interface ConceptFlow {
  scenes: SceneDef[];
  sceneIndex: number;
  scene: SceneDef;
  /** True once the current scene's goal has been met. */
  sceneDone: boolean;
  /** True for scenes whose goal was met at any point this run. */
  isDone(sceneId: string): boolean;
  /** The scene's goal is met: unlock its skill and open the way forward. */
  completeScene(): void;
  /** Move to the next scene; from the last scene, finish the concept. */
  advance(): void;
  /** Jump to a scene (revisits and scene pickers). */
  goTo(index: number): void;
  /** True after advancing past the last scene; progress has been recorded. */
  finished: boolean;
  restart(): void;
}

/**
 * Drives a concept's learning arc: gated scene progression, skill unlocks,
 * and completion. Scenes decide *when* the goal is met (completeScene) and
 * should only offer "next" once sceneDone is true; the flow handles the rest.
 */
export function useConceptFlow({ conceptId, scenes }: ConceptFlowOptions): ConceptFlow {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [doneIds, setDoneIds] = useState<readonly string[]>([]);
  const [finished, setFinished] = useState(false);

  const scene = scenes[sceneIndex];

  const completeScene = useCallback(() => {
    if (scene.skill) unlockSkill(scene.skill.id);
    setDoneIds((ids) => (ids.includes(scene.id) ? ids : [...ids, scene.id]));
  }, [scene]);

  const advance = useCallback(() => {
    if (sceneIndex < scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
    } else {
      setFinished(true);
      markCompleted(conceptId);
    }
  }, [sceneIndex, scenes.length, conceptId]);

  const goTo = useCallback(
    (index: number) => setSceneIndex(Math.max(0, Math.min(index, scenes.length - 1))),
    [scenes.length]
  );

  const restart = useCallback(() => {
    setSceneIndex(0);
    setDoneIds([]);
    setFinished(false);
  }, []);

  return {
    scenes,
    sceneIndex,
    scene,
    sceneDone: doneIds.includes(scene.id),
    isDone: (sceneId) => doneIds.includes(sceneId),
    completeScene,
    advance,
    goTo,
    finished,
    restart,
  };
}
