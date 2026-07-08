import { useCallback, useState } from 'react';

export type ExerciseResult = 'correct' | 'retry';

export interface ExerciseRunner<Round, Answer> {
  round: Round;
  index: number;
  total: number;
  /** Wrong tries on the current round — lets scenes offer escalating hints. */
  attempts: number;
  /** Outcome of the latest submit, cleared when the round changes. */
  result: ExerciseResult | null;
  /** True once the current round is solved; call next() to move on. */
  solved: boolean;
  /** All rounds solved. */
  done: boolean;
  submit(answer: Answer): ExerciseResult;
  next(): void;
  reset(): void;
}

/**
 * A sequence of exercise rounds with unlimited gentle retries. The scene owns
 * the question/answer UI; the runner owns progression. Splitting submit()
 * from next() leaves room for a celebration beat after each correct answer.
 */
export function useExerciseRunner<Round, Answer>(
  rounds: Round[],
  check: (round: Round, answer: Answer) => boolean
): ExerciseRunner<Round, Answer> {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [done, setDone] = useState(false);

  const solved = result === 'correct';

  const submit = useCallback(
    (answer: Answer): ExerciseResult => {
      const outcome: ExerciseResult = check(rounds[index], answer) ? 'correct' : 'retry';
      setResult(outcome);
      if (outcome === 'retry') setAttempts((n) => n + 1);
      return outcome;
    },
    [rounds, index, check]
  );

  const next = useCallback(() => {
    if (index < rounds.length - 1) {
      setIndex(index + 1);
      setAttempts(0);
      setResult(null);
    } else {
      setDone(true);
    }
  }, [index, rounds.length]);

  const reset = useCallback(() => {
    setIndex(0);
    setAttempts(0);
    setResult(null);
    setDone(false);
  }, []);

  return { round: rounds[index], index, total: rounds.length, attempts, result, solved, done, submit, next, reset };
}
