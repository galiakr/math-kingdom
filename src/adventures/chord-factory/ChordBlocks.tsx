import { colorOf } from './primes';

interface ChordBlocksProps {
  /** Prime factors with repeats, e.g. [2, 2, 3] for 12. */
  factors: number[];
  /** Hide the colors (gray "?" blocks) — the detective's unsolved mystery. */
  mystery?: boolean;
  /** Compact blocks for chips and baskets. */
  small?: boolean;
}

/**
 * The visual voice of every chord: one colored block per prime factor,
 * stacked bottom-up (12 shows teal-teal-purple). This is the non-negotiable
 * visual parallel to the sound — a child who can't hear the chord reads it
 * from the stack alone.
 */
export default function ChordBlocks({ factors, mystery = false, small = false }: ChordBlocksProps) {
  return (
    <span className={`chord-blocks${small ? ' chord-blocks-small' : ''}`} aria-hidden="true">
      {factors.map((prime, i) => (
        <span
          key={i}
          className={`chord-block${mystery ? ' chord-block-mystery' : ''}`}
          style={mystery ? undefined : { background: colorOf(prime) }}
        >
          {mystery ? '?' : prime}
        </span>
      ))}
    </span>
  );
}
