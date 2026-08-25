import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useObserverRollup from '@src/hooks/useObserverRollup';
import { InfoIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Below this many observations an epoch's ratio is arithmetic noise — three
 * observers filing three reports is 100%, and means nothing. Those points are
 * plotted but marked, rather than dropped: a gap would hide that the epoch was
 * barely observed, which is itself worth seeing.
 */
const LOW_SAMPLE_THRESHOLD = 5;

type Point = {
  epochIndex: number;
  independence: number;
  observationCount: number;
  distinctReportTxIds: number;
  lowSample: boolean;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p: Point = payload[0].payload;
  return (
    <div className="rounded-md border border-grey-500 bg-containerL0 px-3 py-2 text-xs">
      <div className="mb-1 text-mid">Epoch {p.epochIndex}</div>
      <div className="text-high">{p.independence.toFixed(0)}% independent</div>
      <div className="text-low">
        {p.distinctReportTxIds} distinct of {p.observationCount} submitted
      </div>
      {p.lowSample && (
        <div className="mt-1 text-warning">Few observations — noisy</div>
      )}
    </div>
  );
};

/**
 * How much of the network's auditing is independent work.
 *
 * The detector publishes a large pile of findings, but most of its kinds are
 * heuristics it reports as uncalibrated, and a count of them has no denominator
 * and no direction — 229 findings is unreadable as good or bad. This is the one
 * signal in that dataset that is definitional rather than inferred, and it comes
 * with its own denominator: of the observers who reported this epoch, how many
 * filed a report nobody else had already filed.
 *
 * Reads the same document the observer rollup already fetches, so the chart
 * costs no additional request.
 */
const IndependencePanel = () => {
  const { data: rollup } = useObserverRollup();
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const points = useMemo<Point[] | undefined>(() => {
    const epochs = rollup?.epochs;
    if (!epochs?.length) return undefined;

    const rows = epochs
      .filter(
        (e) =>
          typeof e.observationCount === 'number' &&
          e.observationCount > 0 &&
          typeof e.distinctReportTxIds === 'number',
      )
      .map((e) => ({
        epochIndex: e.epochIndex,
        observationCount: e.observationCount as number,
        distinctReportTxIds: e.distinctReportTxIds as number,
        independence:
          ((e.distinctReportTxIds as number) / (e.observationCount as number)) *
          100,
        lowSample: (e.observationCount as number) < LOW_SAMPLE_THRESHOLD,
      }))
      .sort((a, b) => a.epochIndex - b.epochIndex);

    return rows.length ? rows : undefined;
  }, [rollup]);

  // Additive panel: without the archive there is nothing to say, and an error
  // here would be noise on a page that still works.
  if (!points) return null;

  // Headline reads the most recent epoch with a usable sample, so a thinly
  // observed final epoch does not present as a perfect score.
  const headlinePoint =
    [...points].reverse().find((p) => !p.lowSample) ??
    points[points.length - 1];
  const shown = activeIndex !== undefined ? points[activeIndex] : headlinePoint;

  return (
    <div className="col-span-1 flex h-full min-h-72 w-full flex-col rounded-xl border border-grey-500 md:col-span-2">
      <div className="flex items-start justify-between px-5 pb-2 pt-5">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-mid">
            Report Independence
          </h3>
          <Tooltip
            message={
              <div className="max-w-80">
                Observers are meant to assess the network independently. This is
                the share of them each epoch that filed a report transaction no
                other observer had already filed — so 100% means every observer
                did their own work, and a dip means some resubmitted a report
                someone else produced. Unlike the correlation detectors, this
                needs no calibration: a shared report transaction is the same
                report under two wallets, not an inference.
              </div>
            }
          >
            <InfoIcon className="size-3 cursor-help text-low" />
          </Tooltip>
        </div>
        <span className="text-xs text-low">
          {points.length} epoch{points.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="px-5">
        {shown ? (
          <>
            <div className="text-2xl font-semibold text-high">
              {shown.independence.toFixed(0)}%
            </div>
            <div className="text-xs text-low">
              {shown.distinctReportTxIds} of {shown.observationCount} observers
              filed their own report
              {activeIndex !== undefined ? ` · epoch ${shown.epochIndex}` : ''}
            </div>
          </>
        ) : (
          <Placeholder className="h-8 w-24" />
        )}
      </div>

      <ResponsiveContainer
        width="100%"
        height="100%"
        className="mb-4 mt-1 min-h-0 flex-1 pr-5 text-xs"
      >
        <AreaChart
          data={points}
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
          <defs>
            <linearGradient
              id="independenceGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#E19EE5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#E19EE5" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#ffffff33"
            vertical={false}
          />
          <XAxis dataKey="epochIndex" tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={38}
          />
          <RechartsTooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="independence"
            stroke="#E19EE5"
            strokeWidth={2}
            strokeOpacity={0.2}
            fillOpacity={0.2}
            fill="url(#independenceGradient)"
            dot={(props: any) => {
              const { cx, cy, index } = props;
              const point = points[index];
              const isActive = index === activeIndex;
              // A thinly observed epoch is marked always, not only on hover:
              // its ratio is real arithmetic on very few reports.
              if (point?.lowSample) {
                return (
                  <circle
                    key={`independence-dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    stroke="#ffb938"
                    strokeWidth={2}
                    fill="#09090A"
                  />
                );
              }
              return (
                <circle
                  key={`independence-dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={isActive ? 4 : 0}
                  stroke={isActive ? '#ffffff' : 'transparent'}
                  strokeWidth={isActive ? 2 : 0}
                  fill={isActive ? '#E19EE5' : 'transparent'}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndependencePanel;
