import { mIOToken } from '@ar.io/sdk';
import Placeholder from '@src/components/Placeholder';
import useEpochs from '@src/hooks/useEpochs';
import { useGlobalState } from '@src/store';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Label,
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

interface RewardsData {
  epoch: number;
  eligible: number;
  claimed: number;
  unclaimed: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label}`}</p>
        <p>{`Claimed Rewards: ${Number(payload[0].value).toFixed(0)}`}</p>
        <p>{`Eligible Rewards: ${(Number(payload[0].value) + Number(payload[1].value)).toFixed(0)}`}</p>
      </div>
    );
  }

  return null;
};

const RewardsDistributionPanel = () => {
  const ticker = useGlobalState((state) => state.ticker);

  const [rewardsData, setRewardsData] = useState<Array<RewardsData>>();
  const { data: epochs } = useEpochs();

  useEffect(() => {
    if (epochs) {
      setRewardsData(
        epochs
          .sort((a, b) => a.epochIndex - b.epochIndex)
          .map((epoch) => {
            const eligible = new mIOToken(
              epoch.distributions.totalEligibleRewards,
            )
              .toIO()
              .valueOf();
            const claimed = new mIOToken(
              epoch.distributions.totalDistributedRewards ?? 0,
            )
              .toIO()
              .valueOf();
            return {
              epoch: epoch.epochIndex,
              eligible,
              claimed,
              unclaimed: eligible - claimed,
            };
          }),
      );
    }
  }, [epochs]);

  return (
    <div className="min-w-[22rem] rounded-xl border border-grey-500">
      <div className="px-5 pt-5 text-sm">
        Eligible Rewards by Epoch vs. Rewards Claimed
      </div>
      <div className="relative h-80">
        {rewardsData ? (
          <div className="size-full text-xs text-low">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rewardsData}
                margin={{ top: 20, right: 16, left: 16, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#DF9BE8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="epoch">
                  <Label value="Epoch" position="insideBottom" offset={-5} />
                </XAxis>
                <YAxis>
                  <Label value={ticker} position="insideLeft" offset={-5} />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={false} />

                {/* <Legend /> */}
                <Bar
                  dataKey="claimed"
                  stackId="a"
                  fill="url(#colorUv)"
                  stroke="rgba(202, 202, 214, 0.32)"
                />
                <Bar
                  dataKey="unclaimed"
                  stackId="a"
                  fill="black"
                  stroke="rgba(202, 202, 214, 0.32)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex size-full">
            <Placeholder className="m-auto h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsDistributionPanel;
