import type { SceneDef } from '../types';

export const CONCEPT_ID = 'topology';

/**
 * The Space Port's learning arc: the rubber rule, the mug→donut morph,
 * counting holes, matching shapes by their holes, and the license ceremony.
 */
export const scenes: SceneDef[] = [
  {
    id: 'rule',
    skill: { id: 'topology-rule', titleKey: 'topology.skills.rule' },
  },
  {
    id: 'morph',
    skill: { id: 'topology-morph', titleKey: 'topology.skills.morph' },
  },
  {
    id: 'cargo',
    skill: { id: 'topology-holes', titleKey: 'topology.skills.holes' },
  },
  {
    id: 'customs',
    skill: { id: 'topology-same', titleKey: 'topology.skills.same' },
  },
  {
    id: 'license',
    skill: { id: 'topology-license', titleKey: 'topology.skills.license' },
  },
];
