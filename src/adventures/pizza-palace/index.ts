import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const pizzaPalace: Adventure = {
  id: CONCEPT_ID,
  emoji: '🍕',
  glyph: '∆',
  accent: '#ff8a5c',
  status: 'available',
  path: '/fractal',
  Page: lazy(() => import('./PizzaPalace')),
  i18n: { en, he },
  ideas: 2,
  moments: 5,
  scenes,
};

export default pizzaPalace;
