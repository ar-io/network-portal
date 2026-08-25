import Tooltip from '@src/components/Tooltip';
import useProtocolEconomics from '@src/hooks/useProtocolEconomics';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import {
  type InflowPoint,
  deriveInflowSeries,
} from '@src/utils/protocolInflow';
import { InfoIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

type Unit = 'ario' | 'usd';

const ON_SCALE = '#E19EE5';
/** Reserved warning colour: an off-scale bar is a caveat, not a bigger value. */
const OFF_SCALE = '#ffb938';
const NEGATIVE = '#7F7F87';

const compact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${Math.round(value)}`;
};

const formatUsd = (value: number): string =>
  Math.abs(value) >= 1000
    ? `$${formatWithCommas(Math.round(value))}`
    : `$${value.toFixed(2)}`;

const ProtocolInflowPanel = () => {
  const { data: economics } = useProtocolEconomics();
  const ticker = useGlobalState((state) => state.ticker);
  const [unit, setUnit] = useState<Unit>('ario');
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const series = useMemo(
    () => deriveInflowSeries(economics?.series),
    [economics],
  );

  // Every epoch carries a price today, but the document allows null, and a USD
  // toggle that silently plots zeros would be worse than not offering it.
  const hasUsd = useMemo(
    () => series?.points.some((p) => typeof p.usd === 'number') ?? false,
    [series],
  );

  const chartData = useMemo(() => {
    if (!series) return undefined;
    const priced = unit === 'usd';
    return series.points.map((p) => {
      const value = priced ? (p.usd ?? 0) : p.ario;
      // The cap is an ARIO threshold; in USD the ratio between epochs is the
      // same, so scale it by the epoch's own price.
      const ceiling = priced
        ? series.cap * (p.ario !== 0 ? (p.usd ?? 0) / p.ario : 0)
        : series.cap;
      return {
        ...p,
        value,
        // Bars are clipped to the ceiling so one treasury event cannot flatten
        // the rest; the tooltip always shows the true figure.
        plotted: p.offScale && ceiling > 0 ? ceiling : value,
      };
    });
  }, [series, unit]);

  if (!series || !chartData) return null;

  const latest = series.points[series.points.length - 1];
  const shown = activeIndex !== undefined ? series.points[activeIndex] : latest;
  const offScaleCount = series.points.filter((p) => p.offScale).length;

  const headline =
    unit === 'usd'
      ? typeof shown?.usd === 'number'
        ? formatUsd(shown.usd)
        : '—'
      : `${formatWithCommas(Math.round(shown?.ario ?? 0))} ${ticker}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p: InflowPoint = payload[0].payload;
    return (
      <div className="rounded-md border border-grey-500 bg-containerL0 px-3 py-2 text-xs">
        <div className="mb-1 text-mid">Epoch {p.epochIndex}</div>
        <div className="text-high">
          {formatWithCommas(Math.round(p.ario))} {ticker}
        </div>
        {typeof p.usd === 'number' && (
          <div className="text-low">{formatUsd(p.usd)} at the time</div>
        )}
        {p.offScale && (
          <div className="mt-1 max-w-48 text-warning">
            Bar clipped — a treasury movement this large is not ordinary income.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="col-span-1 flex h-full min-h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-4">
      <div className="flex flex-wrap items-start justify-between gap-2 px-5 pb-2 pt-5">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-mid">Protocol Inflow</h3>
          <Tooltip
            message={
              <div className="max-w-80">
                What flowed into the protocol treasury each epoch — the change
                in its balance plus the rewards it paid out over the same
                period.
                <br />
                <br />
                Called inflow rather than revenue on purpose: this measures
                everything that moved into the treasury, and cannot separate
                registration fees from one-off transfers. USD figures use the
                ARIO price at that epoch, so they are what the inflow was worth
                then.
              </div>
            }
          >
            <InfoIcon className="size-3 cursor-help text-low" />
          </Tooltip>
        </div>

        {hasUsd && (
          <div className="flex overflow-hidden rounded-md border border-grey-600 text-xs">
            {(['ario', 'usd'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                // Roomier on a phone, where 24px is an awkward tap target.
                className={`px-3 py-2 transition-colors sm:px-2.5 sm:py-1 ${
                  unit === u
                    ? 'bg-grey-700 text-high'
                    : 'text-low hover:text-mid'
                }`}
              >
                {u === 'ario' ? ticker || 'ARIO' : 'USD'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5">
        <div className="text-2xl font-semibold text-high">{headline}</div>
        <div className="text-xs text-low">
          {activeIndex !== undefined
            ? `epoch ${shown?.epochIndex}`
            : `most recent epoch (${shown?.epochIndex})`}
        </div>
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        className="mt-2 min-h-0 flex-1 pr-5 text-xs"
      >
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          onMouseMove={(state: any) => {
            if (
              state?.isTooltipActive &&
              state.activeTooltipIndex !== undefined
            )
              setActiveIndex(state.activeTooltipIndex);
          }}
          onMouseLeave={() => setActiveIndex(undefined)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ffffff33"
            vertical={false}
          />
          <XAxis dataKey="epochIndex" tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v: number) =>
              unit === 'usd' ? `$${compact(v)}` : compact(v)
            }
          />
          <RechartsTooltip
            content={<CustomTooltip />}
            cursor={{ fill: '#ffffff0a' }}
          />
          <Bar dataKey="plotted" radius={[2, 2, 0, 0]}>
            {chartData.map((point, index) => (
              <Cell
                key={point.epochIndex}
                fill={
                  point.offScale
                    ? OFF_SCALE
                    : point.value < 0
                      ? NEGATIVE
                      : ON_SCALE
                }
                fillOpacity={
                  activeIndex === undefined || activeIndex === index ? 1 : 0.4
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {offScaleCount > 0 && (
        <div className="px-5 pb-4 pt-1 text-xs text-low">
          {offScaleCount === 1 ? 'One epoch is' : `${offScaleCount} epochs are`}{' '}
          clipped in amber: a treasury movement far larger than any epoch of
          income, which would otherwise flatten the rest.
        </div>
      )}
    </div>
  );
};

export default ProtocolInflowPanel;
