import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import Streak from '@src/components/Streak';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useRewardsForAddress from '@src/hooks/useRewardsForAddress';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface StakingRewardsCardProps {
  walletAddress?: string;
}

const StakingRewardsCard = ({ walletAddress }: StakingRewardsCardProps) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { data: epochSettings } = useEpochSettings();

  const [epochCount, setEpochCount] = useState(7); // Default to 1 week
  const [percentageChange, setPercentageChange] = useState<number>();

  const { data: rewardsResult, isLoading } = useRewardsForAddress(
    walletAddress,
    epochCount,
  );

  const rewardsData = rewardsResult?.rewardsData;
  const totalRewards = rewardsResult?.totalRewards;

  const [hoveredData, setHoveredData] = useState<{
    epochIndex: number;
    rewards: number;
  } | null>(null);

  // Show individual epoch reward when hovering, total when not
  const displayedRewards = hoveredData ? hoveredData.rewards : totalRewards;

  useEffect(() => {
    if (!rewardsData || rewardsData.length < 2) {
      setPercentageChange(undefined);
      return;
    }

    if (hoveredData) {
      // When hovering, show percentage change from previous epoch's individual rewards
      const hoveredIndex = rewardsData.findIndex(
        (item) => item.epochIndex === hoveredData.epochIndex,
      );

      if (hoveredIndex > 0) {
        const currentEpochReward = hoveredData.rewards;
        const previousEpochReward = rewardsData[hoveredIndex - 1].rewards;

        const change =
          previousEpochReward > 0
            ? ((currentEpochReward - previousEpochReward) /
                previousEpochReward) *
              100
            : currentEpochReward > 0
              ? 100
              : 0;
        setPercentageChange(change);
      } else {
        setPercentageChange(undefined);
      }
    } else {
      // Show percentage change for total rewards vs last epoch's total
      const lastIndex = rewardsData.length - 1;
      const secondLastIndex = lastIndex - 1;

      const currentTotal = rewardsData
        .slice(0, lastIndex + 1)
        .reduce((sum, data) => sum + data.rewards, 0);
      const previousTotal = rewardsData
        .slice(0, secondLastIndex + 1)
        .reduce((sum, data) => sum + data.rewards, 0);

      const change =
        previousTotal > 0
          ? ((currentTotal - previousTotal) / previousTotal) * 100
          : currentTotal > 0
            ? 100
            : 0;
      setPercentageChange(change);
    }
  }, [hoveredData, rewardsData]);

  const hasEpochZeroStarted = epochSettings?.hasEpochZeroStarted ?? true;
  const epochZeroStartTimestamp = epochSettings?.epochZeroStartTimestamp;

  return (
    <div className="relative flex flex-col rounded-xl border border-grey-600 px-6 py-5 h-48 overflow-hidden">
      {/* Background Chart */}
      {!isLoading && rewardsData && rewardsData.length >= 2 && (
        <div className="absolute inset-0 top-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={rewardsData}
              margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
              onMouseMove={(state) => {
                if (state?.activePayload?.[0]?.payload) {
                  setHoveredData(state.activePayload[0].payload);
                } else {
                  setHoveredData(null);
                }
              }}
              onMouseLeave={() => {
                setHoveredData(null);
              }}
            >
              <defs>
                <linearGradient
                  id="stakingRewardsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#E19EE5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E19EE5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="epochIndex"
                axisLine={false}
                tickLine={false}
                tick={false}
                height={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={false}
                width={0}
                domain={[1, 'dataMax']}
              />
              <Tooltip content={() => null} cursor={false} />
              <Area
                type="monotone"
                dataKey="rewards"
                stroke="#E19EE5"
                strokeWidth={2}
                strokeOpacity={0.2}
                fillOpacity={0.2}
                fill="url(#stakingRewardsGradient)"
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

      {/* Main Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-mid">Total ARIO Rewards</span>
          <EpochSelector value={epochCount} onChange={setEpochCount} />
        </div>
      </div>

      <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-col">
        {epochZeroStartTimestamp && !hasEpochZeroStarted ? (
          <div className="flex grow items-center justify-center self-center text-center text-sm italic text-low">
            Staking rewards begin on{' '}
            {new Date(epochZeroStartTimestamp).toLocaleDateString()}
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <div className="text-xs text-mid mb-1">
                {hoveredData
                  ? `Epoch ${hoveredData.epochIndex}`
                  : 'Total Earned'}
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-[2.625rem] font-bold text-high leading-none">
                  {isLoading || displayedRewards === undefined ? (
                    <Placeholder />
                  ) : (
                    formatWithCommas(displayedRewards)
                  )}
                </div>
                <div className="text-sm text-high">{ticker}</div>
              </div>
            </div>
            {hoveredData && percentageChange !== undefined && (
              <div className="flex flex-col items-end">
                <div className="text-xs text-mid mb-1">vs Previous</div>
                <Streak
                  streak={percentageChange}
                  fixedDigits={2}
                  rightLabel="%"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StakingRewardsCard;
