import type { ConceptFlow } from '../../../engine';

/** Every scene gets the concept flow; it reports its goal via completeScene(). */
export interface SceneProps {
  flow: ConceptFlow;
}
