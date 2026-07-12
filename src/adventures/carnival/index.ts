import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const probabilityCarnival: Adventure = {
  id: CONCEPT_ID,
  emoji: '🎪',
  glyph: '%',
  accent: '#ff7ab2',
  status: 'available',
  path: '/probability',
  Page: lazy(() => import('./ProbabilityCarnival')),
  i18n: { en, he },
  ideas: 2,
  moments: 5,
  scenes,
};

export default probabilityCarnival;
