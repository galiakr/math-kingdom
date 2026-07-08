import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { isPrime } from '../primes';
import type { SceneProps } from './types';

const BEATS = 30;
const BEAT_MS = 480;
const BEAT_NUMBERS = Array.from({ length: BEATS }, (_, i) => i + 1);

/**
 * Scene 6 — the free-play finale. Drum every 2, shaker every 3, bell every 5:
 * steady rhythms you can predict. The golden trumpet plays on prime beats —
 * and no one can predict when the next one comes. Ends with the cicada
 * wonder moment after one full cycle.
 */
export default function SceneOrchestra({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [cycled, setCycled] = useState(false);

  const rows = [
    { id: 'drum', emoji: '🥁', hits: (n: number) => n % 2 === 0 },
    { id: 'shaker', emoji: '🪇', hits: (n: number) => n % 3 === 0 },
    { id: 'bell', emoji: '🔔', hits: (n: number) => n % 5 === 0 },
    { id: 'trumpet', emoji: '🎺', hits: isPrime },
  ];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setBeat((b) => (b % BEATS) + 1), BEAT_MS);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (beat === 0) return;
    if (beat % 2 === 0) audio.playDrum();
    if (beat % 3 === 0) audio.playShaker();
    if (beat % 5 === 0) audio.playBell();
    if (isPrime(beat)) audio.playTrumpet();
    if (beat === BEATS) {
      setCycled(true);
      flow.completeScene();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat]);

  const toggle = async () => {
    if (!playing && !audio.ready) await audio.start();
    setPlaying((p) => !p);
  };

  return (
    <div className="cf-body">
      <div className="controls">
        <button type="button" className="btn btn-primary" onClick={() => void toggle()}>
          {playing ? `⏸ ${t('primes.buttons.stop')}` : `▶ ${t('primes.buttons.play')}`}
        </button>
      </div>

      <div className="beat-grid-scroll">
        <div className="beat-grid" role="img" aria-label={t('primes.scenes.orchestra.title')}>
          <span className="beat-label" aria-hidden="true">
            {t('primes.scenes.orchestra.beat')}
          </span>
          {BEAT_NUMBERS.map((n) => (
            <span
              key={n}
              className={`beat-number${isPrime(n) ? ' is-prime' : ''}${
                n === beat ? ' is-now' : ''
              }`}
            >
              {n}
            </span>
          ))}
          {rows.map((row) => (
            <div key={row.id} className={`beat-row beat-row-${row.id}`}>
              <span className="beat-label">
                <span aria-hidden="true">{row.emoji}</span>{' '}
                {t(`primes.scenes.orchestra.instruments.${row.id}`)}
              </span>
              {BEAT_NUMBERS.map((n) => (
                <span
                  key={n}
                  className={`beat-cell${row.hits(n) ? ' is-hit' : ''}${
                    row.id === 'trumpet' && row.hits(n) ? ' is-golden' : ''
                  }${n === beat ? ' is-now' : ''}${
                    n === beat && row.hits(n) ? ' is-firing' : ''
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {cycled && (
        <aside className="cf-cicada">
          <h3 className="cf-cicada-title">{t('primes.scenes.orchestra.cicadaTitle')}</h3>
          <p>{t('primes.scenes.orchestra.cicadaText')}</p>
        </aside>
      )}
    </div>
  );
}
