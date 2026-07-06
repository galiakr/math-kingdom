import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import he from './he.json';

const STORAGE_KEY = 'math-kingdom-lang';

const isSupported = (lang: string | null): lang is 'en' | 'he' =>
  lang === 'en' || lang === 'he';

// ?lang=he / ?lang=en beats the saved preference, so links are shareable.
const urlLanguage = new URLSearchParams(window.location.search).get('lang');
const stored = localStorage.getItem(STORAGE_KEY);
const initialLanguage = isSupported(urlLanguage)
  ? urlLanguage
  : isSupported(stored)
    ? stored
    : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

function applyDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
  applyDocumentLanguage(language);
});

applyDocumentLanguage(initialLanguage);

export default i18n;
