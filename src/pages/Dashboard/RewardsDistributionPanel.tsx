import { isDistributedEpochData, mARIOToken } from '@ar.io/sdk/web';
import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useEpochsWithCount from '@src/hooks/useEpochsWithCount';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useMemo, useState } from 'react';
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
        <p>{`Distributed Rewards: ${formatWithCommas(Number(payload[0].value))}`}</p>
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

const CustomUnclaimedBar = ({
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

interface RewardsDistributionPanelProps {
  epochCount: number;
  onEpochCountChange: (value: number) => void;
  hoveredEpochIndex?: number | null;
  onEpochHover?: (epochIndex: number | null) => void;
}

const RewardsDistributionPanel = ({
  epochCount,
  onEpochCountChange,
  hoveredEpochIndex,
  onEpochHover,
}: RewardsDistributionPanelProps) => {
  const ticker = useGlobalState((state) => state.ticker);

  const [focusBar, setFocusBar] = useState<number>();
  const [mouseLeave, setMouseLeave] = useState(true);
  const { data: epochs } = useEpochsWithCount(epochCount);
  const { data: epochSettings } = useEpochSettings();

  const rewardsData: Array<RewardsData> | undefined = useMemo(() => {
    const data = epochs
      ?.filter((epoch) => epoch !== undefined)
      .sort((a, b) => a!.epochIndex - b!.epochIndex)
      .map((epoch) => {
        const eligible = new mARIOToken(
          epoch!.distributions.totalEligibleRewards,
        )
          .toARIO()
          .valueOf();

        const distributed = isDistributedEpochData(epoch!.distributions)
          ? epoch!.distributions.totalDistributedRewards
          : 0;

        const claimed = new mARIOToken(distributed).toARIO().valueOf();
        return {
          epoch: epoch!.epochIndex,
          eligible,
          claimed,
          unclaimed: eligible - claimed,
        };
      });

    return data;
  }, [epochs]);

  // Update focus when external hover changes
  useEffect(() => {
    if (hoveredEpochIndex !== null && rewardsData) {
      const index = rewardsData.findIndex(
        (item) => item.epoch === hoveredEpochIndex,
      );
      if (index >= 0) {
        setFocusBar(index);
        setMouseLeave(false);
      }
    } else if (hoveredEpochIndex === null) {
      setFocusBar(undefined);
      setMouseLeave(true);
    }
  }, [hoveredEpochIndex, rewardsData]);

  return (
    <div className="rounded-xl border border-grey-500 lg:min-w-[22rem]">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <span className="text-sm text-mid">
          Eligible Rewards in {ticker} by Epoch vs. Rewards Distributed
        </span>
        <EpochSelector value={epochCount} onChange={onEpochCountChange} />
      </div>
      <div className="relative h-80">
        {rewardsData ? (
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
                    if (rewardsData && onEpochHover) {
                      const epochData = rewardsData[state.activeTooltipIndex];
                      if (epochData) {
                        onEpochHover(epochData.epoch);
                      }
                    }
                  } else {
                    setFocusBar(undefined);
                    setMouseLeave(true);
                  }
                }}
                onMouseLeave={() => {
                  setMouseLeave(true);
                  if (onEpochHover) {
                    onEpochHover(null);
                  }
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
                  {rewardsData.map((_entry, index) => (
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
                  shape={CustomUnclaimedBar}
                >
                  {rewardsData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      strokeDasharray={
                        index === rewardsData.length - 1 ? '3 3' : undefined
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
