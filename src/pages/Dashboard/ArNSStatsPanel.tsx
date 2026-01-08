import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useArNSStats from '@src/hooks/useArNSStats';
import useArNSStatsWithCount from '@src/hooks/useArNSStatsWithCount';
import useEpochSettings from '@src/hooks/useEpochSettings';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

interface ArNSStatsPanelProps {
  epochCount: number;
  onEpochCountChange: (value: number) => void;
}

const ArNSStatsPanel = ({
  epochCount,
  onEpochCountChange,
}: ArNSStatsPanelProps) => {
  const { data: epochSettings } = useEpochSettings();
  const { data: arnsStats } = useArNSStats();
  const { data: historicalArNSStats } = useArNSStatsWithCount(epochCount);
  const [hoveredData, setHoveredData] = useState<{
    epochIndex: number;
    totalActiveNames: number;
  } | null>(null);

  return (
    <div className="relative flex flex-col rounded-xl border border-grey-500 px-6 py-5 lg:min-w-[22rem] h-full min-h-64 overflow-hidden">
      {/* Background Chart */}
      {historicalArNSStats && historicalArNSStats.length >= 2 && (
        <div className="absolute inset-0 top-16 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalArNSStats}
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
                  id="arnsStatsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#E19EE5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E19EE5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={false}
                width={0}
                domain={['dataMin', 'dataMax']}
              />
              <Area
                type="monotone"
                dataKey="totalActiveNames"
                stroke="#E19EE5"
                strokeWidth={2}
                fill="url(#arnsStatsGradient)"
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-mid">
            ArNS Names
            {arnsStats && (
              <Tooltip
                message={
                  <div>
                    <div className="mb-2 font-semibold text-high">
                      ArNS Stats
                    </div>
                    <div>
                      <div>Names Purchased: {arnsStats.namesPurchased}</div>
                      <div>Returned Names: {arnsStats.totalReturnedNames}</div>
                      <div>
                        Grace Period Names: {arnsStats.totalGracePeriodNames}
                      </div>
                    </div>
                  </div>
                }
              >
                <InfoIcon className="size-[1.125rem] text-low" />
              </Tooltip>
            )}
          </div>

          <EpochSelector value={epochCount} onChange={onEpochCountChange} />
        </div>
      </div>
      <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-col">
        {epochSettings && !epochSettings.hasEpochZeroStarted ? (
          <div className="flex grow items-center justify-center self-center text-center text-sm italic text-low">
            Awaiting first epoch...
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {hoveredData && (
                <div className="text-xs text-mid mb-1">
                  Epoch {hoveredData.epochIndex}
                </div>
              )}
              <div className="text-[2.625rem] font-bold text-high leading-none">
                {hoveredData ? (
                  formatWithCommas(hoveredData.totalActiveNames)
                ) : arnsStats ? (
                  formatWithCommas(arnsStats.namesPurchased)
                ) : (
                  <Placeholder />
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-mid mb-1">Demand Factor</div>
              <div className="text-2xl font-bold text-high">
                {arnsStats ? (
                  arnsStats.demandFactor.toFixed(3)
                ) : (
                  <Placeholder />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArNSStatsPanel;
