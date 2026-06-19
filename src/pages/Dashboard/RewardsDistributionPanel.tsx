import { mARIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useEpochsWithCount from '@src/hooks/useEpochsWithCount';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useMemo, useState } from 'react';
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

const EPOCH_COUNT = 7; // Contract retains ~7 epochs on-chain

interface RewardsData {
  epoch: number;
  gatewayRewards: number;
  observerRewards: number;
  gatewayCount: number;
  observerCount: number;
  status: 'Distributed' | 'Pending';
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RewardsData;
    const total = data.gatewayRewards + data.observerRewards;
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label} (${data.status})`}</p>
        <p>{`Gateway Rewards: ${formatWithCommas(data.gatewayRewards)} ARIO (${data.gatewayCount} gateways)`}</p>
        <p>{`Observer Rewards: ${formatWithCommas(data.observerRewards)} ARIO (${data.observerCount} observers)`}</p>
        <p>{`Total: ${formatWithCommas(total)} ARIO`}</p>
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

const _CustomUnclaimedBar = ({
  fill,
  x,
  y,
  width,
  height,
  strokeDasharray: strokeDashArray,
  stroke,
}: Props) => {
  return strokeDashArray ? (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height ? height - 1 : 0}
        fill={fill}
      />
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={Number(y) + Number(height)}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
      <line
        x1={x}
        y1={y}
        x2={Number(x) + Number(width)}
        y2={y}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
      <line
        x1={Number(x) + Number(width)}
        y1={y}
        x2={Number(x) + Number(width)}
        y2={Number(y) + Number(height)}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
    </g>
  ) : (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={stroke}
        fill={fill}
      />
    </g>
  );
};

const RewardsDistributionPanel = () => {
  const ticker = useGlobalState((state) => state.ticker);

  const [focusBar, setFocusBar] = useState<number>();
  const [mouseLeave, setMouseLeave] = useState(true);
  const { data: epochs } = useEpochsWithCount(EPOCH_COUNT);
  const { data: epochSettings } = useEpochSettings();
  const currentEpochIndex = useGlobalState(
    (state) => state.currentEpoch?.epochIndex,
  );

  const rewardsData: Array<RewardsData> | undefined = useMemo(() => {
    const data = epochs
      ?.filter((epoch) => epoch !== undefined)
      .sort((a, b) => a!.epochIndex - b!.epochIndex)
      .map((epoch) => {
        const gatewayRewards = new mARIOToken(
          epoch!.distributions.totalEligibleGatewayReward,
        )
          .toARIO()
          .valueOf();
        const observerRewards = new mARIOToken(
          epoch!.distributions.totalEligibleObserverReward,
        )
          .toARIO()
          .valueOf();

        return {
          epoch: epoch!.epochIndex,
          gatewayRewards,
          observerRewards,
          gatewayCount: epoch!.distributions.totalEligibleGateways,
          observerCount: epoch!.prescribedObservers.length,
          status: (epoch!.epochIndex === currentEpochIndex
            ? 'Pending'
            : 'Distributed') as RewardsData['status'],
        };
      });

    return data;
  }, [epochs, currentEpochIndex]);

  return (
    <div className="rounded-xl border border-grey-500">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <span className="text-sm text-mid">Rewards by Epoch ({ticker})</span>
        <span className="text-xs text-low">Last 7 Epochs</span>
      </div>
      <div className="relative h-80">
        {rewardsData && rewardsData.length > 0 ? (
          <div className="size-full text-xs text-low">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rewardsData}
                margin={{ top: 20, right: 16, left: 8, bottom: 10 }}
                onMouseMove={(state) => {
                  if (
                    state.isTooltipActive &&
                    state.activeTooltipIndex !== undefined
                  ) {
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
                  <linearGradient
                    id="gatewayRewardGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.25} />
                    <stop
                      offset="100%"
                      stopColor="#DF9BE8"
                      stopOpacity={0.125}
                    />
                  </linearGradient>
                  <linearGradient
                    id="gatewayRewardHover"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#DF9BE8" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient
                    id="observerRewardGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3DB7C2" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#3DB7C2"
                      stopOpacity={0.15}
                    />
                  </linearGradient>
                  <linearGradient
                    id="observerRewardHover"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3DB7C2" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#3DB7C2" stopOpacity={0.5} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="epoch" />
                <YAxis tickFormatter={(v) => formatWithCommas(v)} />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Bar
                  dataKey="gatewayRewards"
                  name="Gateway Rewards"
                  stackId="rewards"
                  fill="url(#gatewayRewardGradient)"
                  stroke="rgba(202, 202, 214, 0.32)"
                  shape={CustomBar(0, 'transparent')}
                >
                  {rewardsData.map((_entry, index) => (
                    <Cell
                      key={`gw-${index}`}
                      fill={
                        index !== focusBar || mouseLeave
                          ? 'url(#gatewayRewardGradient)'
                          : 'url(#gatewayRewardHover)'
                      }
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="observerRewards"
                  name="Observer Rewards"
                  stackId="rewards"
                  fill="url(#observerRewardGradient)"
                  stroke="rgba(202, 202, 214, 0.32)"
                  shape={CustomBar(1, 'white')}
                >
                  {rewardsData.map((_entry, index) => (
                    <Cell
                      key={`obs-${index}`}
                      fill={
                        index !== focusBar || mouseLeave
                          ? 'url(#observerRewardGradient)'
                          : 'url(#observerRewardHover)'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : epochSettings && !epochSettings.hasEpochZeroStarted ? (
          <div className="flex size-full">
            <div className="m-auto h-4 text-sm italic text-low">
              Awaiting first epoch...
            </div>
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
