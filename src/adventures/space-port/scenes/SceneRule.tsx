import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseRunner } from '../../../engine';
import { BlobArt } from '../art';
import type { SceneProps } from './types';

type Verdict = 'allowed' | 'forbidden';

interface MoveRound {
  id: string;
  emoji: string;
  answer: Verdict;
}

// Interleaved so neither verdict gets a winning streak.
const ROUNDS: MoveRound[] = [
  { id: 'stretch', emoji: '🤲', answer: 'allowed' },
  { id: 'cut', emoji: '✂️', answer: 'forbidden' },
  { id: 'bend', emoji: '🌀', answer: 'allowed' },
  { id: 'poke', emoji: '📌', answer: 'forbidden' },
  { id: 'squish', emoji: '🫸', answer: 'allowed' },
  { id: 'glue', emoji: '🩹', answer: 'forbidden' },
];

const POSES = [
  { id: 'stretch', emoji: '🤲' },
  { id: 'squish', emoji: '🫸' },
  { id: 'bend', emoji: '🌀' },
] as const;

const FORBIDDEN = [
  { id: 'cut', emoji: '✂️' },
  { id: 'poke', emoji: '📌' },
] as const;

/**
 * Scene 1 — the rubber rule. Free play with Gloop first (stretch away,
 * scissors get a big alien NO), then a six-round allowed/forbidden test.
 */
export default function SceneRule({ flow }: SceneProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'play' | 'quiz'>('play');
  const [pose, setPose] = useState<string>('rest');
  const [warning, setWarning] = useState(false);
  const warnTimerRef = useRef<number | undefined>(undefined);

  const runner = useExerciseRunner<MoveRound, Verdict>(
    ROUNDS,
    (round, verdict) => verdict === round.answer
  );
  const [shelves, setShelves] = useState<Record<Verdict, MoveRound[]>>({
    allowed: [],
    forbidden: [],
  });

  useEffect(() => {
    if (runner.done) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner.done]);

  useEffect(() => () => window.clearTimeout(warnTimerRef.current), []);

  const forbid = () => {
    window.clearTimeout(warnTimerRef.current);
    setWarning(true);
    warnTimerRef.current = window.setTimeout(() => setWarning(false), 1400);
  };

  const answer = (verdict: Verdict) => {
    if (runner.solved || runner.done) return;
    if (runner.submit(verdict) === 'correct') {
      setShelves((s) => ({ ...s, [verdict]: [...s[verdict], runner.round] }));
      window.setTimeout(runner.next, 900);
    }
  };

  if (phase === 'play') {
    return (
      <div className="tp-body">
        <div className={`tp-gloop-stage${warning ? ' is-warning' : ''}`}>
          <BlobArt className={`tp-pose-${pose}${warning ? ' is-shaking' : ''}`} />
          {warning && (
            <div className="tp-no-bubble" role="alert">
              <span className="tp-no-alien" aria-hidden="true">
                👽
              </span>
              {t('topology.scenes.rule.noMsg')}
            </div>
          )}
          {!warning && pose !== 'rest' && (
            <p className="tp-feedback">{t('topology.scenes.rule.sameMsg')}</p>
          )}
        </div>

        <div className="tp-move-row">
          {POSES.map((move) => (
            <button
              key={move.id}
              type="button"
              className="tp-move tp-move-ok"
              onClick={() => setPose(pose === move.id ? 'rest' : move.id)}
            >
              <span aria-hidden="true">{move.emoji}</span>{' '}
              {t(`topology.scenes.rule.moves.${move.id}`)}
            </button>
          ))}
          {FORBIDDEN.map((move) => (
            <button
              key={move.id}
              type="button"
              className="tp-move tp-move-no"
              onClick={forbid}
            >
              <span aria-hidden="true">{move.emoji}</span>{' '}
              {t(`topology.scenes.rule.moves.${move.id}`)}
            </button>
          ))}
        </div>

        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={() => setPhase('quiz')}>
            🧪 {t('topology.buttons.ready')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-body">
      {!runner.done && (
        <>
          <p className="tp-hint">{t('topology.scenes.rule.quizPrompt')}</p>
          <div className="tp-card">
            <span className="tp-card-emoji" aria-hidden="true">
              {runner.round.emoji}
            </span>
            <span className="tp-card-text">
              {t(`topology.scenes.rule.moves.${runner.round.id}`)}
            </span>
          </div>
          <div className="tp-verdict-row">
            <button
              type="button"
              className="tp-verdict tp-verdict-yes"
              disabled={runner.solved}
              onClick={() => answer('allowed')}
            >
              🟢 {t('topology.scenes.rule.allowed')}
            </button>
            <button
              type="button"
              className="tp-verdict tp-verdict-no"
              disabled={runner.solved}
              onClick={() => answer('forbidden')}
            >
              🔴 {t('topology.scenes.rule.forbidden')}
            </button>
          </div>
        </>
      )}

      <p className="tp-feedback" aria-live="polite">
        {runner.done
          ? t('topology.scenes.rule.done')
          : runner.result === 'correct'
            ? t('topology.scenes.rule.correct')
            : runner.result === 'retry'
              ? runner.attempts >= 2
                ? t('topology.scenes.rule.retryHint2')
                : t('topology.scenes.rule.retry')
              : ' '}
      </p>

      <div className="tp-shelves">
        {(['allowed', 'forbidden'] as const).map((verdict) => (
          <div key={verdict} className={`tp-shelf tp-shelf-${verdict}`}>
            <h3 className="tp-shelf-title">
              {verdict === 'allowed' ? '🟢' : '🔴'}{' '}
              {t(`topology.scenes.rule.${verdict}`)}
            </h3>
            <div className="tp-shelf-chips">
              {shelves[verdict].map((round) => (
                <span key={round.id} className="tp-chip">
                  <span aria-hidden="true">{round.emoji}</span>{' '}
                  {t(`topology.scenes.rule.moves.${round.id}`)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
