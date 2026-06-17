import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import Streak from '@src/components/Streak';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useObservations from '@src/hooks/useObservations';
import useObserversWithCount from '@src/hooks/useObserversWithCount';
import { useGlobalState } from '@src/store';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label}`}</p>
        <p>{`Performance: ${Number(payload[0].value).toFixed(2)}%`}</p>
        <p>{`Submitted: ${data.reportsCount}/${data.prescribedObservers}`}</p>
      </div>
    );
  }

  return null;
};

interface ObserverPerformancePanelProps {
  epochCount: number;
  onEpochCountChange: (value: number) => void;
  hoveredEpochIndex?: number | null;
  onEpochHover?: (epochIndex: number | null) => void;
}

const ObserverPerformancePanel = ({
  epochCount,
  onEpochCountChange,
  hoveredEpochIndex,
  onEpochHover,
}: ObserverPerformancePanelProps) => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { data: epochSettings } = useEpochSettings();
  const { data: historicalObserverStats } = useObserversWithCount(epochCount);

  const [activeIndex, setActiveIndex] = useState<number>();
  const [percentageChange, setPercentageChange] = useState<number>();

  // Sync active index with external hover or default to latest
  useEffect(() => {
    if (historicalObserverStats) {
      if (hoveredEpochIndex !== null && hoveredEpochIndex !== undefined) {
        const index = historicalObserverStats.findIndex(
          (item) => item.epochIndex === hoveredEpochIndex,
        );
        setActiveIndex(index >= 0 ? index : historicalObserverStats.length - 1);
      } else {
        setActiveIndex(historicalObserverStats.length - 1);
      }
    }
  }, [historicalObserverStats, hoveredEpochIndex]);

  // Compute percentage change vs previous epoch
  useEffect(() => {
    if (
      !activeIndex ||
      !historicalObserverStats ||
      !historicalObserverStats[activeIndex]
    ) {
      setPercentageChange(undefined);
    } else {
      const current =
        historicalObserverStats[activeIndex].performancePercentage;
      const previous =
        historicalObserverStats[activeIndex - 1]?.performancePercentage;
      if (previous !== undefined) {
        setPercentageChange(current - previous);
      } else {
        setPercentageChange(undefined);
      }
    }
  }, [activeIndex, historicalObserverStats]);

  const { data: observations } = useObservations(currentEpoch);
  const reportsCount = observations
    ? Object.keys(observations.reports).length
    : undefined;
  const prescribedCount = currentEpoch
    ? currentEpoch.prescribedObservers.length
    : undefined;

  // Display value: hovered historical data or current epoch live data
  const displayPercentage =
    activeIndex !== undefined && historicalObserverStats?.[activeIndex]
      ? historicalObserverStats[activeIndex].performancePercentage.toFixed(2) +
        '%'
      : reportsCount !== undefined && prescribedCount !== undefined
        ? ((100 * reportsCount) / prescribedCount).toFixed(2) + '%'
        : undefined;

  const displaySubmitted =
    activeIndex !== undefined && historicalObserverStats?.[activeIndex]
      ? `${historicalObserverStats[activeIndex].reportsCount}/${historicalObserverStats[activeIndex].prescribedObservers}`
      : reportsCount !== undefined && prescribedCount !== undefined
        ? `${reportsCount}/${prescribedCount}`
        : undefined;

  return (
    <div className="flex h-full min-h-72 flex-col rounded-xl border border-grey-500 text-sm text-mid">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-mid">Observer Performance</span>
        <EpochSelector value={epochCount} onChange={onEpochCountChange} />
      </div>
      <div className="flex items-end justify-between px-6">
        <div className="flex gap-2">
          <div className="py-4 text-[2.625rem] font-bold leading-none text-high">
            {displayPercentage ?? <Placeholder />}
          </div>
          {percentageChange !== undefined && (
            <div className="flex h-full flex-col justify-end pb-5">
              <Streak
                streak={percentageChange}
                fixedDigits={2}
                rightLabel="%"
              />
            </div>
          )}
        </div>
        <div className="pb-5 text-right text-xs">
          {displaySubmitted ? (
            <>
              <div>{displaySubmitted}</div>
              <div>observations submitted</div>
            </>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
      {historicalObserverStats && historicalObserverStats.length >= 2 ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="mb-5 mt-2 min-h-0 flex-1 pr-6 text-xs"
        >
          <AreaChart
            data={historicalObserverStats}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (
                state.isTooltipActive &&
                state.activeTooltipIndex !== undefined &&
                historicalObserverStats
              ) {
                const epochData =
                  historicalObserverStats[state.activeTooltipIndex];
                if (epochData && onEpochHover) {
                  onEpochHover(epochData.epochIndex);
                }
              }
            }}
            onMouseLeave={() => {
              if (onEpochHover) {
                onEpochHover(null);
              }
            }}
          >
            <defs>
              <linearGradient
                id="observerPerformanceGradient"
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
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="performancePercentage"
              stroke="#E19EE5"
              strokeWidth={2}
              strokeOpacity={0.2}
              fillOpacity={0.2}
              fill="url(#observerPerformanceGradient)"
              dot={(props) => {
                const { cx, cy, index } = props;
                const isActive = index === activeIndex;

                return (
                  <circle
                    key={`observer-dot-${index}`}
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
      ) : epochSettings && !epochSettings.hasEpochZeroStarted ? (
        <div className="m-auto pb-12 text-sm italic text-low">
          Awaiting first epoch...
        </div>
      ) : historicalObserverStats && historicalObserverStats.length < 2 ? (
        <div className="m-auto pb-12 text-sm italic text-low">
          Historical trend available soon
        </div>
      ) : (
        <Placeholder className="m-auto" />
      )}
    </div>
  );
};

export default ObserverPerformancePanel;
