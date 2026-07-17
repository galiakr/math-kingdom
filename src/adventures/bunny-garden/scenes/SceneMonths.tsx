import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { FIB, LAST_MONTH, isBaby, nestsUpTo, pairsAt } from '../fib';
import type { SceneProps } from './types';

// Prediction options for months 4, 5, 6 (answers 3, 5, 8).
const PREDICTIONS: Record<number, number[]> = {
  4: [2, 3, 4],
  5: [4, 5, 6],
  6: [6, 7, 8],
};

const PENTA = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];

/**
 * Scene 1 — the bunny months. The rule card stays pinned; every press of
 * "Next month" applies it to the whole garden. From month 4 the child
 * predicts the next pair count before the garden reveals it.
 */
export default function SceneMonths({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [month, setMonth] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<'correct' | 'retry' | null>(null);
  const timersRef = useRef<number[]>([]);

  const nests = nestsUpTo(month);
  const mustPredict = month >= 3 && month < LAST_MONTH;

  useEffect(() => {
    if (month >= LAST_MONTH) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(
    () => () => timersRef.current.forEach((id) => window.clearTimeout(id)),
    []
  );

  const advance = () => {
    const next = month + 1;
    audio.playDrum();
    setMonth(next);
    setAttempts(0);
    setResult(null);
    // Newborn nests pop one by one, each with its own pip.
    const newborn = nestsUpTo(next).filter((nest) => nest.bornMonth === next);
    newborn.forEach((nest, i) => {
      timersRef.current.push(
        window.setTimeout(() => audio.playNote(PENTA[nest.id % PENTA.length]), 250 + i * 140)
      );
    });
    if (next === 2) {
      // No newborns in month 2 — the event is the babies growing up.
      timersRef.current.push(window.setTimeout(audio.playShaker, 250));
    }
  };

  const predict = (n: number) => {
    if (n === pairsAt(month + 1)) {
      audio.playChord(['C4', 'E4', 'G4']);
      setResult('correct');
      timersRef.current.push(window.setTimeout(advance, 500));
    } else {
      setAttempts((a) => a + 1);
      setResult('retry');
    }
  };

  return (
    <div className="fib-body">
      <div className="fib-rule-card">
        <p>🐰🐰 → 🐇🐇 {t('fibonacci.rule.babiesGrow')}</p>
        <p>🐇🐇 → 🐰🐰 {t('fibonacci.rule.adultsMake')}</p>
      </div>

      <div className="fib-field" aria-live="polite">
        {nests.map((nest) => {
          const baby = isBaby(nest, month);
          return (
            <div
              key={nest.id}
              className={`fib-nest${baby ? ' is-baby' : ''}${
                nest.bornMonth === month ? ' is-new' : ''
              }`}
            >
              <span aria-hidden="true">{baby ? '🐰🐰' : '🐇🐇'}</span>
            </div>
          );
        })}
      </div>

      <p className="fib-counter">
        {t('fibonacci.scenes.months.monthLabel')}{' '}
        <span className="fib-ltr fib-count-chip">{month} 🌙</span>{' '}
        {t('fibonacci.scenes.months.pairsLabel')}{' '}
        <span className="fib-ltr fib-count-chip">{pairsAt(month)}</span>{' '}
        {t('fibonacci.scenes.months.bunniesLabel')}{' '}
        <span className="fib-ltr fib-count-chip">{pairsAt(month) * 2}</span>
      </p>

      <div className="fib-strip fib-ltr" aria-label={t('fibonacci.scenes.months.title')}>
        {FIB.slice(0, month).map((n, i) => (
          <span key={i} className={`fib-seq-chip${i === month - 1 ? ' is-latest' : ''}`}>
            {n}
          </span>
        ))}
      </div>

      {month === 2 && <p className="fib-feedback">{t('fibonacci.scenes.months.grewUp')}</p>}

      {!mustPredict && month < LAST_MONTH && (
        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={advance}>
            🌙 {t('fibonacci.buttons.nextMonth')}
          </button>
        </div>
      )}

      {mustPredict && (
        <div className="fib-question">
          <p className="fib-question-text">{t('fibonacci.scenes.months.predictPrompt')}</p>
          <div className="fib-choices fib-ltr">
            {PREDICTIONS[month + 1].map((n) => (
              <button
                key={n}
                type="button"
                className="fib-choice"
                disabled={result === 'correct'}
                onClick={() => predict(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="fib-feedback" aria-live="polite">
            {result === 'correct'
              ? t('fibonacci.scenes.months.correct')
              : result === 'retry'
                ? attempts >= 2
                  ? t('fibonacci.scenes.months.retryHint2')
                  : t('fibonacci.scenes.months.retry')
                : ' '}
          </p>
        </div>
      )}

      {flow.sceneDone && (
        <p className="fib-feedback">{t('fibonacci.scenes.months.done')}</p>
      )}
    </div>
  );
}
