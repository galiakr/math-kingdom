import { totalWeight } from './wheel';
import type { SectorId, WheelSector } from './wheel';

interface TallyChartProps {
  sectors: WheelSector[];
  counts: Record<SectorId, number>;
  /** Dashed markers at each color's fair share of the spins so far. */
  showExpected?: boolean;
}

/**
 * Goldie's live tally: one CSS column per color, bottom-aligned. Forced LTR
 * so the bars always match the wheel's sector order, in both languages.
 */
export default function TallyChart({ sectors, counts, showExpected = false }: TallyChartProps) {
  const spins = sectors.reduce((sum, s) => sum + counts[s.id], 0);
  const total = totalWeight(sectors);
  const scale = Math.max(...sectors.map((s) => counts[s.id]), 8);

  return (
    <div className="cv-chart cv-ltr">
      {sectors.map((sector) => {
        const count = counts[sector.id];
        const expected = (sector.weight / total) * spins;
        return (
          <div key={sector.id} className="cv-chart-col">
            <div className="cv-chart-track">
              {showExpected && (
                <div
                  className="cv-chart-expected"
                  style={{ bottom: `${(expected / scale) * 100}%` }}
                />
              )}
              <div
                className="cv-chart-bar"
                style={{
                  height: `${(count / scale) * 100}%`,
                  background: sector.colorVar,
                }}
              />
            </div>
            <span className="cv-chart-count">{count}</span>
            <span className="cv-chart-emoji" aria-hidden="true">
              {sector.emoji}
            </span>
          </div>
        );
      })}
    </div>
  );
}
