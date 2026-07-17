import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GraphView from '../GraphView';
import { BANNER_GRAPH } from '../graphs';
import type { SceneProps } from './types';

type BannerColor = 'red' | 'gold' | 'teal';

const SWATCHES: { id: BannerColor; var: string }[] = [
  { id: 'red', var: 'var(--flag-red)' },
  { id: 'gold', var: 'var(--gold)' },
  { id: 'teal', var: 'var(--banner-teal)' },
];

/**
 * Scene 5 — the banner festival: hoist a banner color on every castle so no
 * two connected castles match. Neighboring matches make the knights argue
 * (conflict edges pulse); recoloring is always allowed.
 */
export default function SceneBanners({ flow }: SceneProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BannerColor>('red');
  const [colors, setColors] = useState<Record<string, BannerColor>>({});

  const conflicts = BANNER_GRAPH.edges
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => colors[e.a] && colors[e.a] === colors[e.b])
    .map(({ i }) => i);

  const allColored = BANNER_GRAPH.nodes.every((n) => colors[n.id]);
  const solved = allColored && conflicts.length === 0;

  useEffect(() => {
    if (solved) flow.completeScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved]);

  return (
    <div className="gk-body">
      <p className="gk-hint">
        {solved
          ? t('graphs.scenes.banners.done')
          : conflicts.length > 0
            ? t('graphs.scenes.banners.conflict')
            : t('graphs.scenes.banners.prompt')}
      </p>

      <div className="gk-swatch-row" role="group" aria-label={t('graphs.scenes.banners.pickColor')}>
        {SWATCHES.map((swatch) => (
          <button
            key={swatch.id}
            type="button"
            className={`gk-swatch${selected === swatch.id ? ' is-picked' : ''}`}
            style={{ background: swatch.var }}
            aria-pressed={selected === swatch.id}
            aria-label={swatch.id}
            onClick={() => setSelected(swatch.id)}
          />
        ))}
      </div>

      <GraphView
        graph={BANNER_GRAPH}
        label={t('graphs.scenes.banners.title')}
        nodeClass={(id) => (colors[id] ? `gk-banner-${colors[id]}` : '')}
        edgeClass={(i) => (conflicts.includes(i) ? 'is-conflict' : '')}
        onNodeTap={(id) => setColors((c) => ({ ...c, [id]: selected }))}
      />

      <p className="gk-counter">
        <span className="gk-ltr gk-count-chip">
          {Object.keys(colors).length} / {BANNER_GRAPH.nodes.length}
        </span>
      </p>

      {solved && (
        <p className="gk-feedback gk-fact">{t('graphs.scenes.banners.fourColorFact')}</p>
      )}
    </div>
  );
}
