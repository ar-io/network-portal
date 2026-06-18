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
  amount: number;
  status: 'Distributed' | 'Pending';
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RewardsData;
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label}`}</p>
        <p>{`${data.status}: ${formatWithCommas(Number(payload[0].value))} ARIO`}</p>
      </div>
    );
  }

  return null;
};

const CustomBar = (borderHeight: number, borderColor: string) => {
  const renderFunc = (props: Props) => {
    const { fill, x, y, width, height } = props;
    const isPending = (props as any).payload?.status === 'Pending';
    const barBorderColor = 'rgba(202, 202, 214, 0.32)';

    if (!height) return <></>;

    if (isPending) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="transparent"
            stroke={barBorderColor}
            strokeDasharray="3 3"
          />
        </g>
      );
    }

    return (
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
        const amount = new mARIOToken(epoch!.distributions.totalEligibleRewards)
          .toARIO()
          .valueOf();

        return {
          epoch: epoch!.epochIndex,
          amount,
          status: (epoch!.epochIndex === currentEpochIndex
            ? 'Pending'
            : 'Distributed') as RewardsData['status'],
        };
      });

    return data;
  }, [epochs, currentEpochIndex]);

  return (
    <div className="flex h-72 flex-col rounded-xl border border-grey-500">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <span className="text-sm text-mid">Rewards by Epoch ({ticker})</span>
        <span className="text-xs text-low">Last 7 Epochs</span>
      </div>
      <div className="relative flex-1">
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
                <YAxis tickFormatter={(v) => formatWithCommas(v)} />
                <Tooltip content={<CustomTooltip />} cursor={false} />

                <Bar
                  dataKey="amount"
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
