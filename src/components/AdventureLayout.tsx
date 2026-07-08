import type { ReactNode } from 'react';
import TopBar from './TopBar';

interface AdventureLayoutProps {
  title: string;
  subtitle: string;
  /** Extra class on <main> for the adventure's own layout tweaks. */
  className?: string;
  /**
   * Theme class scoping the adventure's own palette and fonts (see
   * global.css — e.g. "theme-night"). Each adventure owns its look;
   * without a theme it inherits the daylight kingdom.
   */
  theme?: string;
  /** The adventure's own full-page backdrop, rendered behind the content. */
  background?: ReactNode;
  children: ReactNode;
}

/**
 * Shared shell for every adventure page: the adventure's backdrop, top bar
 * (whose brand mark links home), and the compact hero header.
 */
export default function AdventureLayout({
  title,
  subtitle,
  className,
  theme,
  background,
  children,
}: AdventureLayoutProps) {
  return (
    <div className={`page${theme ? ` ${theme}` : ''}`}>
      {background}
      <TopBar />
      <main className={`container${className ? ` ${className}` : ''}`}>
        <header className="hero hero-compact">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
        </header>

        {children}
      </main>
    </div>
  );
}
