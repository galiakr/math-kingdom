import type { ComponentType, LazyExoticComponent } from 'react';

export type AdventureStatus = 'available' | 'soon' | 'locked';

/** Translation bundle merged into the app resources at startup. */
export type AdventureTranslations = {
  en: Record<string, unknown>;
  he: Record<string, unknown>;
};

export interface Adventure {
  id: string;
  /** Playful companion icon shown on the badge chip. */
  emoji: string;
  /** Math glyph used as the card's watermark — each adventure's "field" symbol. */
  glyph: string;
  accent: string;
  status: AdventureStatus;
  /** Route for the adventure page; required once status is 'available'. */
  path?: string;
  /** Lazily loaded page component; required once status is 'available'. */
  Page?: LazyExoticComponent<ComponentType>;
  /** The adventure's own strings, rooted at its i18n namespace (e.g. "hotel"). */
  i18n?: AdventureTranslations;
  /** Big mathematical ideas the adventure teaches; defaults to 1. */
  ideas?: number;
  /** Interactive scenarios/chapters inside the adventure; defaults to 1. */
  moments?: number;
}
