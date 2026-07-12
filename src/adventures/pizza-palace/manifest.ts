import type { SceneDef } from '../types';

export const CONCEPT_ID = 'fractal';

/**
 * The Pizza Palace's learning arc: meet the slicing rule, zoom to feel
 * self-similarity, count to feel exponential growth, hunt fractals in the
 * wild, then invent a repeat rule of your own.
 */
export const scenes: SceneDef[] = [
  { id: 'slice' },
  {
    id: 'zoom',
    skill: { id: 'fractal-self-similar', titleKey: 'fractal.skills.selfSimilar' },
  },
  {
    id: 'count',
    skill: { id: 'fractal-powers-of-three', titleKey: 'fractal.skills.powersOfThree' },
  },
  {
    id: 'hunt',
    skill: { id: 'fractal-in-nature', titleKey: 'fractal.skills.inNature' },
  },
  {
    id: 'chef',
    skill: { id: 'fractal-repeat-rule', titleKey: 'fractal.skills.repeatRule' },
  },
];
