import type { SceneDef } from '../types';

export const CONCEPT_ID = 'infinity';

/**
 * The hotel's learning arc: each scenario is a scene, and completing it
 * unlocks the infinity idea it demonstrates.
 */
export const scenes: SceneDef[] = [
  {
    id: 'single',
    skill: { id: 'infinity-one-more', titleKey: 'hotel.skills.oneMore' },
  },
  {
    id: 'bus',
    skill: { id: 'infinity-doubling', titleKey: 'hotel.skills.doubling' },
  },
  {
    id: 'infinite',
    skill: { id: 'infinity-matching', titleKey: 'hotel.skills.matching' },
  },
];
