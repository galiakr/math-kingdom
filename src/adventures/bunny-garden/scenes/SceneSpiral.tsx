import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../../audio';
import { SPIRAL_SQUARES, SQUARE_VARS } from '../fib';
import type { SceneProps } from './types';

const TOTAL = SPIRAL_SQUARES.length;
// Size questions before squares 6 (3+5) and 7 (5+8).
const SIZE_QUESTIONS: Record<number, number[]> = {
  5: [7, 8, 9],
  6: [12, 13, 14],
};
const SCALE_NOTES = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'];

// The shape-match beat: width-to-height ratios; the golden one wins.
const SHAPES = [
  { id: 'skinny', ratio: 3 },
  { id: 'square', ratio: 1.05 },
  { id: 'golden', ratio: 1.615 },
];

type Golden = 'measure' | 'match' | 'matched';

/**
 * Scene 3 — build the golden spiral from Fibonacci squares. One big button
 * grows each square where the ghost outline pulses; squares 6 and 7 ask
 * their size first (3+5, 5+8). The φ finale is celebration, never a gate.
 */
export default function SceneSpiral({ flow }: SceneProps) {
  const { t } = useTranslation();
  const audio = useAudio();
  const [placed, setPlaced] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<'correct' | 'retry' | null>(null);
  const [golden, setGolden] = useState<Golden | null>(null);
  const [matchResult, setMatchResult] = useState<'correct' | 'retry' | null>(null);

  const built = placed >= TOTAL;
  const question = !built ? SIZE_QUESTIONS[placed] : undefined;

  useEffect(() => {
    if (built) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);

  const grow = () => {
    if (built) return;
    audio.playNote(SCALE_NOTES[placed]);
    setPlaced((p) => p + 1);
    setResult(null);
    setAttempts(0);
    if (placed + 1 === TOTAL) audio.playChord(['C4', 'E4', 'G4', 'C5']);
  };

  const answerSize = (n: number) => {
    if (n === SPIRAL_SQUARES[placed].size) {
      audio.playChord(['C4', 'E4', 'G4']);
      grow();
    } else {
      setAttempts((a) => a + 1);
      setResult('retry');
    }
  };

  const measure = () => {
    audio.playTrumpet('G5');
    setGolden('measure');
  };

  const answerMatch = (id: string) => {
    if (id === 'golden') {
      audio.playBell();
      setMatchResult('correct');
      setGolden('matched');
    } else {
      setMatchResult('retry');
    }
  };

  return (
    <div className="fib-body">
      <p className="fib-hint">
        {built
          ? golden
            ? golden === 'matched'
              ? t('fibonacci.scenes.spiral.done')
              : t('fibonacci.scenes.spiral.matchPrompt')
            : t('fibonacci.scenes.spiral.goldenTitle')
          : question
            ? t('fibonacci.scenes.spiral.askSize')
            : t('fibonacci.scenes.spiral.growPrompt')}
      </p>

      <svg
        viewBox="-4 -14 218 148"
        className={`fib-spiral fib-ltr${built ? ' is-built' : ''}`}
        role="img"
        aria-label={t('fibonacci.scenes.spiral.title')}
      >
        {SPIRAL_SQUARES.map((sq, i) => (
          <rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={sq.size * 10}
            height={sq.size * 10}
            className={`fib-square${i < placed ? ' is-placed' : ''}`}
            style={{ fill: SQUARE_VARS[i % SQUARE_VARS.length], stroke: SQUARE_VARS[i % SQUARE_VARS.length] }}
          />
        ))}
        {SPIRAL_SQUARES.map((sq, i) => (
          <path
            key={`arc-${i}`}
            d={sq.arc}
            pathLength={100}
            className={`fib-arc${i < placed ? ' is-drawn' : ''}`}
          />
        ))}
        {!built && (
          <rect
            x={SPIRAL_SQUARES[placed].x}
            y={SPIRAL_SQUARES[placed].y}
            width={SPIRAL_SQUARES[placed].size * 10}
            height={SPIRAL_SQUARES[placed].size * 10}
            className="fib-ghost"
          />
        )}
        {golden && (
          <g className="fib-measure">
            <text x="105" y="-4" textAnchor="middle" className="fib-measure-label">
              21
            </text>
            <text x="200" y="68" textAnchor="middle" className="fib-measure-label">
              13
            </text>
          </g>
        )}
      </svg>

      {!built && !question && (
        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={grow}>
            🌱 {t('fibonacci.buttons.grow')}
          </button>
        </div>
      )}

      {!built && question && (
        <div className="fib-question">
          <div className="fib-choices fib-ltr">
            {question.map((n) => (
              <button key={n} type="button" className="fib-choice" onClick={() => answerSize(n)}>
                {n}
              </button>
            ))}
          </div>
          <p className="fib-feedback" aria-live="polite">
            {result === 'retry'
              ? attempts >= 2
                ? t('fibonacci.scenes.spiral.retryHint2')
                : t('fibonacci.scenes.spiral.retry')
              : ' '}
            {result === 'retry' && attempts >= 2 && (
              <span className="fib-ltr fib-count-chip">
                {SPIRAL_SQUARES[placed - 2].size} + {SPIRAL_SQUARES[placed - 1].size} = ?
              </span>
            )}
          </p>
        </div>
      )}

      {built && !golden && (
        <div className="controls">
          <button type="button" className="btn btn-primary" onClick={measure}>
            📏 {t('fibonacci.buttons.measure')}
          </button>
        </div>
      )}

      {golden && (
        <>
          <p className="fib-golden-line">
            <span className="fib-ltr fib-count-chip">21 ÷ 13 ≈ 1.6</span>{' '}
            {t('fibonacci.scenes.spiral.goldenText')}
          </p>

          {golden !== 'matched' && (
            <div className="fib-shapes">
              {SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  className="fib-shape-btn"
                  aria-label={t(`fibonacci.scenes.spiral.shapes.${shape.id}`)}
                  onClick={() => answerMatch(shape.id)}
                >
                  <span
                    className="fib-shape"
                    style={{ width: `${shape.ratio * 34}px`, height: '34px' }}
                  />
                </button>
              ))}
            </div>
          )}

          <p className="fib-feedback" aria-live="polite">
            {golden === 'matched'
              ? t('fibonacci.scenes.spiral.matchCorrect')
              : matchResult === 'retry'
                ? t('fibonacci.scenes.spiral.matchRetry')
                : ' '}
          </p>

          {golden === 'matched' && (
            <div className="fib-vignettes">
              {(['shell', 'sunflower', 'galaxy'] as const).map((id) => (
                <figure key={id} className="fib-vignette">
                  <span className="fib-vignette-emoji" aria-hidden="true">
                    {id === 'shell' ? '🐚' : id === 'sunflower' ? '🌻' : '🌌'}
                  </span>
                  <svg viewBox="0 0 210 130" className="fib-vignette-spiral" aria-hidden="true">
                    {SPIRAL_SQUARES.map((sq, i) => (
                      <path key={i} d={sq.arc} className="fib-vignette-arc" />
                    ))}
                  </svg>
                  <figcaption>{t(`fibonacci.scenes.spiral.vignettes.${id}`)}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
