import enTokens from './locales/en.json' with { type: "json" };
import heTokens from './locales/he.json' with { type: "json" };

const languageTokens = {
  en: enTokens,
  he: heTokens,
};

let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', function () {
  addLanguageSwitcher();
  updateContent();
});

function addLanguageSwitcher() {
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';
  switcher.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
    direction: ltr;
  `;
  
  const languages = [
    { code: 'en', label: '🇺🇸 EN' },
    { code: 'he', label: '🇮🇱 עב' }
  ];
  
  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.textContent = lang.label;
    btn.className = currentLanguage === lang.code ? 'lang-btn active' : 'lang-btn';
    btn.style.cssText = `
      padding: 8px 15px;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.2);
      color: white;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    `;
    btn.addEventListener('click', () => changeLanguage(lang.code));
    switcher.appendChild(btn);
  });
  
  document.body.appendChild(switcher);
}

function changeLanguage(lang) {
  currentLanguage = lang;
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(lang.toUpperCase()));
  });
  
  updateContent();
  
  // Hilberts Hotel
  if (window.hilbertsHotel) {
    window.hilbertsHotel.updateScenarioContent();
  }
}

function updateContent() {
  if (currentLanguage === 'he') {
    document.documentElement.setAttribute('lang', 'he');
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', 'ltr');
  }
  
  const tokens = languageTokens[currentLanguage] || languageTokens['en'];
  
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translatedText = getNestedValue(tokens, key);
    if (translatedText) {
      element.textContent = translatedText;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translatedText = getNestedValue(tokens, key);
    if (translatedText) {
      element.placeholder = translatedText;
    }
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

function t(key, params = {}) {
  const tokens = languageTokens[currentLanguage] || languageTokens['en'];
  let text = getNestedValue(tokens, key) || key;

  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
  });

  return text;
}

// Special function for infinity story content with scenario.step 
function getStoryContent(scenario, step) {
  const key = `infinity-explanation.${scenario}.${step}`;
  return t(key);
}

function formatStoryContent(content) {
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

window.t = t;
window.getStoryContent = getStoryContent;
window.formatStoryContent = formatStoryContent;
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = () => currentLanguage;