import type { SceneDef } from '../types';

export const CONCEPT_ID = 'probability';

/**
 * The carnival's learning arc: likelihood words at the gate, then chance on
 * one spin, comparing chances, what many tries reveal, and finally fairness.
 */
export const scenes: SceneDef[] = [
  {
    id: 'booths',
    skill: { id: 'probability-words', titleKey: 'probability.skills.words' },
  },
  {
    id: 'spinner',
    skill: { id: 'probability-big-slice', titleKey: 'probability.skills.bigSlice' },
  },
  {
    id: 'eggs',
    skill: { id: 'probability-compare', titleKey: 'probability.skills.compare' },
  },
  {
    id: 'tally',
    skill: { id: 'probability-long-run', titleKey: 'probability.skills.longRun' },
  },
  {
    id: 'fair',
    skill: { id: 'probability-fair', titleKey: 'probability.skills.fair' },
  },
];
