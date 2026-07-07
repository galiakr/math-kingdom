import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AtlasBackground from './AtlasBackground';
import TopBar from './TopBar';

interface AdventureLayoutProps {
  title: string;
  subtitle: string;
  /** Extra class on <main> for the adventure's own layout tweaks. */
  className?: string;
  children: ReactNode;
}

/**
 * Shared shell for every adventure page: starry background, top bar,
 * back-to-kingdom link, and the compact hero header.
 */
export default function AdventureLayout({
  title,
  subtitle,
  className,
  children,
}: AdventureLayoutProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="page">
      <AtlasBackground />
      <TopBar />
      <main className={`container${className ? ` ${className}` : ''}`}>
        <Link to="/" className="back-link">
          <span aria-hidden="true">{isRtl ? '→' : '←'}</span> {t('common.back')}
        </Link>

        <header className="hero hero-compact">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
        </header>

        {children}
      </main>
    </div>
  );
}
