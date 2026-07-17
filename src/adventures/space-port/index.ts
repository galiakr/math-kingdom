import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const spacePort: Adventure = {
  id: CONCEPT_ID,
  emoji: '🚀',
  glyph: '≈',
  accent: '#5ac8fa',
  status: 'available',
  path: '/topology',
  Page: lazy(() => import('./SpacePort')),
  i18n: { en, he },
  ideas: 2,
  moments: 5,
  scenes,
};

export default spacePort;
