import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const castleBridges: Adventure = {
  id: CONCEPT_ID,
  emoji: '🏰',
  glyph: '∴',
  accent: '#4edcd2',
  status: 'available',
  path: '/graphs',
  Page: lazy(() => import('./CastleBridges')),
  i18n: { en, he },
  ideas: 2,
  moments: 5,
  scenes,
};

export default castleBridges;
