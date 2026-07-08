import { lazy } from 'react';
import type { Adventure } from '../types';
import { CONCEPT_ID, scenes } from './manifest';
import en from './en.json';
import he from './he.json';

const chordFactory: Adventure = {
  id: CONCEPT_ID,
  emoji: '🎼',
  glyph: '7',
  accent: '#ffc94d',
  status: 'available',
  path: '/primes',
  Page: lazy(() => import('./ChordFactory')),
  i18n: { en, he },
  ideas: 2,
  moments: 6,
  scenes,
};

export default chordFactory;
