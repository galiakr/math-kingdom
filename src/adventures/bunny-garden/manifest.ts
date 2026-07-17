import type { SceneDef } from '../types';

export const CONCEPT_ID = 'fibonacci';

/**
 * The garden's learning arc: watch the sequence grow out of the bunny rule,
 * find the addition secret, build the golden spiral from the numbers, then
 * spot the same numbers wearing flower petals outside.
 */
export const scenes: SceneDef[] = [
  {
    id: 'months',
    skill: { id: 'fibonacci-sequence', titleKey: 'fibonacci.skills.sequence' },
  },
  {
    id: 'sums',
    skill: { id: 'fibonacci-add', titleKey: 'fibonacci.skills.add' },
  },
  {
    id: 'spiral',
    skill: { id: 'fibonacci-spiral', titleKey: 'fibonacci.skills.spiral' },
  },
  {
    id: 'nature',
    skill: { id: 'fibonacci-nature', titleKey: 'fibonacci.skills.nature' },
  },
];
