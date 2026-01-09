import Button from '@src/components/Button';
import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import { BinocularsIcon } from '@src/components/icons';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useObserversWithCount from '@src/hooks/useObserversWithCount';
import { useGlobalState } from '@src/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  YAxis,
} from 'recharts';

interface ObserverPerformancePanelProps {
  epochCount: number;
  onEpochCountChange: (value: number) => void;
}

const ObserverPerformancePanel = ({
  epochCount,
  onEpochCountChange,
}: ObserverPerformancePanelProps) => {
  const _navigate = useNavigate();
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { data: epochSettings } = useEpochSettings();
  const { data: historicalObserverStats } = useObserversWithCount(epochCount);
  const [hoveredData, setHoveredData] = useState<{
    epochIndex: number;
    performancePercentage: number;
    reportsCount: number;
    prescribedObservers: number;
  } | null>(null);

  const reportsCount = currentEpoch
    ? Object.keys(currentEpoch.observations.reports).length
    : undefined;

  return (
    <div className="relative flex flex-col rounded-xl border border-grey-500 px-6 py-5 overflow-hidden h-full min-h-64">
      {/* Background Chart */}
      {historicalObserverStats && historicalObserverStats.length >= 2 && (
        <div className="absolute inset-0 top-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalObserverStats}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              onMouseMove={(state) => {
                if (state?.activePayload?.[0]?.payload) {
                  setHoveredData(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredData(null)}
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
              <YAxis axisLine={false} tickLine={false} tick={false} width={0} />
              <RechartsTooltip content={() => null} cursor={false} />
              <Area
                type="monotone"
                dataKey="performancePercentage"
                stroke="#E19EE5"
                strokeWidth={2}
                strokeOpacity={0.2}
                fillOpacity={0.2}
                fill="url(#observerPerformanceGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#E19EE5',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insufficient data message */}
      {historicalObserverStats && historicalObserverStats.length === 1 && (
        <div className="absolute bottom-2 right-2 text-xs text-low opacity-50 pointer-events-none">
          Historical trend available soon
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <div className="flex w-full items-center overflow-x-auto justify-between">
          <div className="text-sm text-mid">Observer Performance</div>
          <div className="flex items-center gap-3">
            <EpochSelector value={epochCount} onChange={onEpochCountChange} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-col">
        {epochSettings && !epochSettings.hasEpochZeroStarted ? (
          <div className="flex grow items-center justify-center self-center text-center text-sm italic text-low">
            Awaiting first epoch...
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {hoveredData && (
                  <div className="text-xs text-mid mb-1">
                    Epoch {hoveredData.epochIndex}
                  </div>
                )}
                <div className="text-[2.625rem] font-bold text-high leading-none">
                  {hoveredData ? (
                    hoveredData.performancePercentage.toFixed(2) + '%'
                  ) : reportsCount !== undefined ? (
                    ((100 * reportsCount) / 50).toFixed(2) + '%'
                  ) : (
                    <Placeholder />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end text-right text-xs text-mid">
                <div className="grow" />
                {hoveredData ? (
                  <>
                    <div>
                      {hoveredData.reportsCount}/
                      {hoveredData.prescribedObservers}
                    </div>
                    <div>observations submitted</div>
                  </>
                ) : reportsCount !== undefined ? (
                  <>
                    <div>{reportsCount}/50</div>
                    <div>observations submitted</div>
                  </>
                ) : (
                  <Placeholder />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ObserverPerformancePanel;
