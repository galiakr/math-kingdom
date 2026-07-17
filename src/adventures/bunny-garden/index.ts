import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const bunnyGarden: Adventure = {
  id: CONCEPT_ID,
  emoji: '🐇',
  glyph: 'φ',
  accent: '#6fe0a8',
  status: 'available',
  path: '/fibonacci',
  Page: lazy(() => import('./BunnyGarden')),
  i18n: { en, he },
  ideas: 2,
  moments: 4,
  scenes,
};

export default bunnyGarden;
