/**
 * The fixed pitch-and-color identity of each prime, used consistently across
 * all six scenes: a child who learns "teal = 2" in scene 1 can rely on it in
 * scene 6. Repeated factors climb an octave (4 = 2×2 plays C in two octaves)
 * — powers of 2 literally are octaves in real acoustics, so the math and the
 * music genuinely agree.
 */
export const PRIME_VOICES: Record<number, { note: string; octave: number; color: string }> = {
  2: { note: 'C', octave: 3, color: '#4edcd2' },
  3: { note: 'E', octave: 3, color: '#9d86ff' },
  5: { note: 'G', octave: 3, color: '#ff8a5c' },
  7: { note: 'Bb', octave: 3, color: '#ffc94d' },
  11: { note: 'D', octave: 4, color: '#ff7ab2' },
  13: { note: 'F', octave: 4, color: '#5ac8fa' },
  // Beyond the factory family, but reachable from the scene-1 pad (2–20).
  17: { note: 'A', octave: 4, color: '#6fe0a8' },
  19: { note: 'B', octave: 4, color: '#e4527b' },
};

/** The prime family the factory works with, in order. */
export const FACTORY_PRIMES = [2, 3, 5, 7, 11, 13];

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** Prime factorization with repeats, ascending: 12 → [2, 2, 3]. */
export function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let rest = n;
  for (let d = 2; d * d <= rest; d++) {
    while (rest % d === 0) {
      factors.push(d);
      rest /= d;
    }
  }
  if (rest > 1) factors.push(rest);
  return factors;
}

export function colorOf(prime: number): string {
  return PRIME_VOICES[prime]?.color ?? '#ffffff';
}

/** The prime's note name, shifted up by octaveShift octaves. */
export function noteOf(prime: number, octaveShift = 0): string {
  const voice = PRIME_VOICES[prime];
  return `${voice.note}${voice.octave + octaveShift}`;
}

/** The notes of a factor list; the k-th repeat of a prime rises k octaves. */
export function notesOfFactors(factors: number[]): string[] {
  const seen = new Map<number, number>();
  return factors.map((prime) => {
    const repeat = seen.get(prime) ?? 0;
    seen.set(prime, repeat + 1);
    return noteOf(prime, repeat);
  });
}

/** A number's chord: rich for composites, a single note for primes. */
export function chordOf(n: number): string[] {
  return notesOfFactors(primeFactors(n));
}
