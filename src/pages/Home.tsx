import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import { adventures, type Adventure } from '../adventures';
import { useCompleted } from '../progress';
import './Home.css';

type Point = [number, number];

/* Station coordinates (% of the map box) for the wide and tall layouts.
   Index-aligned with the adventures registry: the trail visits them in order,
   winding from the near meadow up toward the mystery castle in the clouds. */
const WIDE: Point[] = [
  [10, 78],
  [26, 60],
  [44, 73],
  [62, 58],
  [78, 71],
  [88, 45],
  [69, 29],
  [46, 16],
];
const TALL: Point[] = [
  [30, 92],
  [72, 83],
  [28, 72],
  [70, 61],
  [30, 50],
  [72, 39],
  [32, 28],
  [58, 15],
];

/** Smooth open curve through all points (Catmull-Rom → cubic Bézier). */
function trailPath(points: Point[]): string {
  const p = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
  }
  return d;
}

function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(
    () => window.matchMedia('(max-width: 640px)').matches
  );
  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const onChange = (event: MediaQueryListEvent) => setNarrow(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

interface StationProps {
  adventure: Adventure;
  x: number;
  y: number;
  done: boolean;
  isCurrent: boolean;
}

function Station({ adventure, x, y, done, isCurrent }: StationProps) {
  const { t } = useTranslation();
  const { id, emoji, accent, status, path } = adventure;

  const content = (
    <>
      {isCurrent && (
        <span className="station-avatar" aria-hidden="true">
          🎒
        </span>
      )}
      <span className="station-badge">
        <span className="station-emoji" aria-hidden="true">
          {emoji}
        </span>
        {done && (
          <span className="station-check" aria-hidden="true">
            ✓
          </span>
        )}
        {status === 'locked' && <span className="station-cloud" aria-hidden="true" />}
      </span>
      <span className="station-name">{t(`home.adventures.${id}.land`)}</span>
      {isCurrent && !done ? (
        <span className="station-flag">{t('home.map.youAreHere')}</span>
      ) : done ? (
        <span className="station-tag tag-done">{t('home.map.visited')}</span>
      ) : (
        <span className="station-tag">
          {t(
            status === 'locked'
              ? 'home.locked'
              : status === 'available'
                ? 'home.map.open'
                : 'home.comingSoon'
          )}
        </span>
      )}
    </>
  );

  const style = {
    left: `${x}%`,
    top: `${y}%`,
    '--accent': accent,
  } as React.CSSProperties;
  const classes = `station station-${status}${done ? ' is-done' : ''}`;

  return status === 'available' && path ? (
    <Link
      to={path}
      className={classes}
      style={style}
      aria-label={t(`home.adventures.${id}.title`)}
    >
      {content}
    </Link>
  ) : (
    <div className={classes} style={style}>
      {content}
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const narrow = useIsNarrow();
  const completed = useCompleted();

  const points = (narrow ? TALL : WIDE).map(
    ([x, y]) => (isRtl ? [100 - x, y] : [x, y]) as Point
  );

  // The traveller stands at the first unfinished open land,
  // or at the last finished one when everything open is done.
  const currentId =
    adventures.find((a) => a.status === 'available' && !completed.includes(a.id))
      ?.id ??
    [...adventures].reverse().find((a) => completed.includes(a.id))?.id;

  const doneCount = adventures.filter((a) => completed.includes(a.id)).length;

  return (
    <div className="page">
      <TopBar />
      <main className="container map-shell">
        <header className="hero map-hero">
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <p className="hero-progress">
            {t('home.map.explored', { done: doneCount, total: adventures.length })}
          </p>
        </header>

        <div className={`map${narrow ? ' map-tall' : ''}`}>
          <div className="map-sun" aria-hidden="true" />
          <div className="map-cloud map-cloud-1" aria-hidden="true" />
          <div className="map-cloud map-cloud-2" aria-hidden="true" />
          <div className="map-cloud map-cloud-3" aria-hidden="true" />
          <svg
            className="map-scene"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -2,40 Q 18,28 38,38 T 72,36 T 104,32 L 104,104 L -2,104 Z"
              fill="#8bcb77"
            />
            <path
              d="M -2,58 Q 24,44 50,54 T 104,50 L 104,104 L -2,104 Z"
              fill="#74bd6a"
            />
            <path
              d="M -2,78 Q 30,66 58,74 T 104,70 L 104,104 L -2,104 Z"
              fill="#5cae5d"
            />
            <path
              className="map-trail"
              d={trailPath(points)}
              fill="none"
              stroke="#fff7df"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="0.01 2.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {adventures.map((adventure, i) => (
            <Station
              key={adventure.id}
              adventure={adventure}
              x={points[i][0]}
              y={points[i][1]}
              done={completed.includes(adventure.id)}
              isCurrent={adventure.id === currentId}
            />
          ))}
        </div>

        <footer className="footer">
          <p>{t('home.footer1')}</p>
          <p>{t('home.footer2')}</p>
        </footer>
      </main>
    </div>
  );
}
