import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import { adventures } from '../adventures';
import { useCompleted } from '../progress';
import './Journal.css';

export default function Journal() {
  const { t } = useTranslation();
  const completed = useCompleted();

  const done = adventures.filter((a) => completed.includes(a.id));
  const ideasCollected = done.reduce((n, a) => n + (a.ideas ?? 1), 0);
  const momentsCollected = done.reduce((n, a) => n + (a.moments ?? 1), 0);

  return (
    <div className="page journal-page">
      <TopBar />
      <main className="container journal">
        <header className="journal-head">
          <h1 className="journal-title">{t('journal.title')}</h1>
          <p className="journal-sub">{t('journal.subtitle')} ✏️</p>
        </header>

        <div className="journal-stats">
          <span className="journal-stat">
            {t('journal.lands')}: <b>{done.length}/{adventures.length}</b>
          </span>
          <span className="journal-stat">
            {t('journal.ideasCount')}: <b>{ideasCollected}</b>
          </span>
          <span className="journal-stat">
            {t('journal.moments')}: <b>{momentsCollected}</b>
          </span>
        </div>

        <section className="journal-stickers" aria-label={t('journal.title')}>
          {adventures.map((adventure) => {
            const isDone = completed.includes(adventure.id);
            const tags = t(`home.adventures.${adventure.id}.tags`, {
              returnObjects: true,
            }) as string[];
            return isDone ? (
              <article key={adventure.id} className="sticker">
                <span className="sticker-tape" aria-hidden="true" />
                <span className="sticker-emoji" aria-hidden="true">
                  {adventure.emoji}
                </span>
                <h2 className="sticker-title">
                  {t(`home.adventures.${adventure.id}.land`)}
                </h2>
                <ul className="sticker-tags">
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p className="sticker-note">
                  {t(`home.adventures.${adventure.id}.note`)}
                </p>
                <span className="sticker-stamp">✓ {t('journal.visited')}</span>
              </article>
            ) : (
              <article key={adventure.id} className="sticker sticker-empty">
                <span className="sticker-emoji" aria-hidden="true">
                  {adventure.emoji}
                </span>
                <h2 className="sticker-title">
                  {t(`home.adventures.${adventure.id}.land`)}
                </h2>
                <ul className="sticker-tags">
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p className="sticker-note">{t('journal.notVisited')}</p>
              </article>
            );
          })}
        </section>

        <section className="journal-ideas">
          <h2 className="journal-ideas-title">{t('journal.ideas')}</h2>
          <ul className="journal-checklist">
            {adventures.map((adventure) => {
              const isDone = completed.includes(adventure.id);
              const tags = t(`home.adventures.${adventure.id}.tags`, {
                returnObjects: true,
              }) as string[];
              return (
                <li key={adventure.id} className={isDone ? 'is-checked' : ''}>
                  <span className="check-box" aria-hidden="true">
                    {isDone ? '☑' : '☐'}
                  </span>
                  <span className="check-text">{tags.join(' · ')}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
