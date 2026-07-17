import type { SceneDef } from '../types';

export const CONCEPT_ID = 'graphs';

/**
 * Castle Bridges' learning arc: see the graph under the map, walk graphs
 * crossing every bridge once, prove Königsberg impossible the way Euler did,
 * predict solvability by counting odd castles, and close with banner coloring.
 */
export const scenes: SceneDef[] = [
  {
    id: 'map',
    skill: { id: 'graphs-map', titleKey: 'graphs.skills.map' },
  },
  {
    id: 'trace',
    skill: { id: 'graphs-trace', titleKey: 'graphs.skills.trace' },
  },
  {
    id: 'bridges',
    skill: { id: 'graphs-euler', titleKey: 'graphs.skills.euler' },
  },
  {
    id: 'predict',
    skill: { id: 'graphs-odd', titleKey: 'graphs.skills.odd' },
  },
  {
    id: 'banners',
    skill: { id: 'graphs-color', titleKey: 'graphs.skills.color' },
  },
];
