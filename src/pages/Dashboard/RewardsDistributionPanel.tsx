import { mIOToken } from '@ar.io/sdk';
import Placeholder from '@src/components/Placeholder';
import useEpochs from '@src/hooks/useEpochs';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Props } from 'recharts/types/cartesian/Bar';

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
        <p>{`Claimed Rewards: ${formatWithCommas(Number(payload[0].value))}`}</p>
        <p>{`Eligible Rewards: ${formatWithCommas(Number(payload[0].value) + Number(payload[1].value))}`}</p>
      </div>
    );
  }

  return null;
};

const CustomBar = (borderHeight: number, borderColor: string) => {
  const renderFunc = ({ fill, x, y, width, height }: Props) => {
    const barBorderColor = 'rgba(202, 202, 214, 0.32)';
    return height ? (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          stroke="none"
          fill={fill}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={borderHeight}
          stroke="none"
          fill={borderColor}
        />
        <rect x={x} y={y} width={1} height={height} fill={barBorderColor} />
        <rect
          x={Number(x) + Number(width) - 1}
          y={y}
          width={1}
          height={height}
          fill={barBorderColor}
        />
      </g>
    ) : (
      <></>
    );
  };
  return renderFunc;
};

const RewardsDistributionPanel = () => {
  const ticker = useGlobalState((state) => state.ticker);

  const [focusBar, setFocusBar] = useState<number>();
  const [mouseLeave, setMouseLeave] = useState(true);
  const [rewardsData, setRewardsData] = useState<Array<RewardsData>>();
  const { data: epochs } = useEpochs();

  useEffect(() => {
    if (epochs) {
      setRewardsData(
        epochs
          .filter((epoch) => epoch !== undefined)
          .sort((a, b) => a!.epochIndex - b!.epochIndex)
          .map((epoch) => {
            const eligible = new mIOToken(
              epoch!.distributions.totalEligibleRewards,
            )
              .toIO()
              .valueOf();
            const claimed = new mIOToken(
              epoch!.distributions.totalDistributedRewards ?? 0,
            )
              .toIO()
              .valueOf();
            return {
              epoch: epoch!.epochIndex,
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
        Eligible Rewards in {ticker} by Epoch vs. Rewards Claimed
      </div>
      <div className="relative h-80">
        {rewardsData ? (
          <div className="size-full text-xs text-low">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rewardsData}
                margin={{ top: 20, right: 16, left: 8, bottom: 10 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive) {
                    setFocusBar(state.activeTooltipIndex);
                    setMouseLeave(false);
                  } else {
                    setFocusBar(undefined);
                    setMouseLeave(true);
                  }
                }}
                onMouseLeave={() => {
                  setMouseLeave(true);
                }}
                barCategoryGap={'20%'}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.25} />
                    <stop
                      offset="100%"
                      stopColor="#DF9BE8"
                      stopOpacity={0.125}
                    />
                  </linearGradient>
                  <linearGradient id="fullBar" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#DF9BE8" stopOpacity={0.5} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Bar
                  dataKey="claimed"
                  stackId="a"
                  fill="url(#colorUv)"
                  stroke="rgba(202, 202, 214, 0.32)"
                  shape={CustomBar(1, 'white')}
                >
                  {rewardsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index !== focusBar || mouseLeave
                          ? 'url(#colorUv)'
                          : 'url(#fullBar)'
                      }
                    />
                  ))}
                </Bar>
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
