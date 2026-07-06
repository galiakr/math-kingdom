import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AtlasBackground from '../components/AtlasBackground';
import TopBar from '../components/TopBar';
import { adventures, type Adventure } from '../adventures';
import './Home.css';

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function StatTile({ value, label }: { value: number; label: string }) {
  const shown = useCountUp(value);
  return (
    <div className="stat-tile">
      <div className="stat-number">{shown}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function AdventureCard({ adventure }: { adventure: Adventure }) {
  const { t } = useTranslation();
  const { id, emoji, glyph, accent, status, path } = adventure;
  const tags = t(`home.adventures.${id}.tags`, { returnObjects: true }) as string[];

  return (
    <article
      className={`card card-${status}`}
      style={{ '--accent': accent } as CSSProperties}
    >
      <span className="card-glyph" aria-hidden="true">
        {glyph}
      </span>
      <div className="card-top">
        <span className="card-emoji" aria-hidden="true">
          {emoji}
        </span>
        {status !== 'available' && (
          <span className="card-badge">
            {t(status === 'soon' ? 'home.comingSoon' : 'home.locked')}
          </span>
        )}
      </div>
      <h3 className="card-title">{t(`home.adventures.${id}.title`)}</h3>
      <p className="card-description">{t(`home.adventures.${id}.description`)}</p>
      <ul className="card-tags">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {status === 'available' && path ? (
        <Link className="card-cta" to={path}>
          {t('home.play')}
        </Link>
      ) : (
        <span className="card-cta card-cta-disabled">
          {t(status === 'soon' ? 'home.comingSoon' : 'home.locked')}
        </span>
      )}
    </article>
  );
}

const unlocked = adventures.filter((a) => a.status === 'available');
const ideasMastered = unlocked.reduce((n, a) => n + (a.ideas ?? 1), 0);
const magicalMoments = unlocked.reduce((n, a) => n + (a.moments ?? 1), 0);

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <AtlasBackground />
      <TopBar />
      <main className="container">
        <header className="hero">
          <h1 className="hero-title">{t('home.title')}</h1>
          <svg
            className="hero-constellation"
            viewBox="0 0 260 26"
            aria-hidden="true"
          >
            <polyline
              points="4,20 62,9 128,16 194,5 256,14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.55"
            />
            {[
              [4, 20],
              [62, 9],
              [128, 16],
              [194, 5],
              [256, 14],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" />
            ))}
          </svg>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
        </header>

        <section className="stats" aria-label={t('home.progress.title')}>
          <h2 className="stats-title">{t('home.progress.title')}</h2>
          <div className="stats-row">
            <StatTile value={unlocked.length} label={t('home.progress.completed')} />
            <StatTile value={ideasMastered} label={t('home.progress.learned')} />
            <StatTile value={magicalMoments} label={t('home.progress.moments')} />
          </div>
        </section>

        <section className="kingdom-grid">
          {adventures.map((adventure) => (
            <AdventureCard key={adventure.id} adventure={adventure} />
          ))}
        </section>

        <footer className="footer">
          <p>{t('home.footer1')}</p>
          <p>{t('home.footer2')}</p>
        </footer>
      </main>
    </div>
  );
}
