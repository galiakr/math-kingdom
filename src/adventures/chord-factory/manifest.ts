import type { SceneDef } from '../types';

export const CONCEPT_ID = 'primes';

/**
 * The Chord Factory's learning arc. Scenes 1–5 build up "primes are the
 * building blocks of all numbers"; scene 6 closes on the complementary
 * truth that primes follow no predictable rhythm.
 */
export const scenes: SceneDef[] = [
  { id: 'sound' },
  {
    id: 'sort',
    skill: { id: 'primes-hears-difference', titleKey: 'primes.skills.hearsDifference' },
  },
  {
    id: 'reveal',
    skill: { id: 'primes-definition', titleKey: 'primes.skills.definition' },
  },
  {
    id: 'factory',
    skill: { id: 'primes-building-blocks', titleKey: 'primes.skills.buildingBlocks' },
  },
  {
    id: 'detective',
    skill: { id: 'primes-factor-detective', titleKey: 'primes.skills.factorDetective' },
  },
  {
    id: 'orchestra',
    skill: { id: 'primes-no-pattern', titleKey: 'primes.skills.noPattern' },
  },
];
