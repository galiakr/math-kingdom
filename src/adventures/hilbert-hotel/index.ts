import { lazy } from 'react';
import type { Adventure } from '../types';
import en from './en.json';
import he from './he.json';

const hilbertHotel: Adventure = {
  id: 'infinity',
  emoji: '🏨',
  glyph: '∞',
  accent: '#9d86ff',
  status: 'available',
  path: '/infinity',
  Page: lazy(() => import('./HilbertHotel')),
  i18n: { en, he },
  moments: 3,
};

export default hilbertHotel;
