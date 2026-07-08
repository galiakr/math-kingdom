import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'en' },
  { code: 'he', label: 'עב' },
] as const;

export default function TopBar() {
  const { t, i18n } = useTranslation();

  return (
    <nav className="topbar">
      <Link to="/" className="topbar-brand">
        <span className="topbar-mark" aria-hidden="true">
          ✦
        </span>
        {t('brand')}
      </Link>
      <div className="topbar-actions">
        <Link to="/journal" className="topbar-journal">
          <span aria-hidden="true">📖</span> {t('nav.journal')}
        </Link>
        <div className="lang-switcher" role="group" aria-label="Language">
          {LANGUAGES.map((lang, i) => (
            <span key={lang.code} className="lang-item">
              {i > 0 && (
                <span className="lang-divider" aria-hidden="true">
                  |
                </span>
              )}
              <button
                type="button"
                className="lang-btn"
                aria-pressed={i18n.language === lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}
