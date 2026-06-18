import Placeholder from '@src/components/Placeholder';
import Streak from '@src/components/Streak';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useGatewaysPerEpochWithCount from '@src/hooks/useGatewaysPerEpochWithCount';
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

const EPOCH_COUNT = 7; // Contract retains ~7 epochs on-chain

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label}`}</p>
        <p>{`Number of Gateways: ${Number(payload[0].value)}`}</p>
      </div>
    );
  }

  return null;
};

const GatewaysInNetworkPanel = () => {
  const { data: gatewaysPerEpoch } = useGatewaysPerEpochWithCount(EPOCH_COUNT);
  const { data: epochSettings } = useEpochSettings();

  const [activeIndex, setActiveIndex] = useState<number>();
  const [percentageChange, setPercentageChange] = useState<number>();

  useEffect(() => {
    if (gatewaysPerEpoch) {
      setActiveIndex(gatewaysPerEpoch.length - 1);
    }
  }, [gatewaysPerEpoch]);

  useEffect(() => {
    if (!activeIndex || !gatewaysPerEpoch || !gatewaysPerEpoch[activeIndex]) {
      setPercentageChange(undefined);
    } else {
      const currentGateways =
        gatewaysPerEpoch[activeIndex].totalEligibleGateways;
      const previousGateways =
        gatewaysPerEpoch[activeIndex - 1].totalEligibleGateways;

      const percentageChange =
        ((currentGateways - previousGateways) / previousGateways) * 100;
      setPercentageChange(percentageChange);
    }
  }, [activeIndex, gatewaysPerEpoch]);

  return (
    <div className="flex h-72 flex-col rounded-xl border border-grey-500 text-sm text-mid">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-mid">Gateways in the Network by Epoch</span>
        <span className="text-xs text-low">Last 7 Epochs</span>
      </div>
      <div className="flex gap-2">
        <div className="py-6 pl-6 text-[2.625rem] text-high">
          {gatewaysPerEpoch &&
            activeIndex !== undefined &&
            gatewaysPerEpoch[activeIndex] &&
            gatewaysPerEpoch[activeIndex].totalEligibleGateways}
        </div>
        {percentageChange !== undefined && (
          <div className="flex h-full flex-col justify-end pb-4">
            <Streak streak={percentageChange} fixedDigits={2} rightLabel="%" />
          </div>
        )}
      </div>
      {gatewaysPerEpoch && gatewaysPerEpoch.length >= 2 ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="mb-5 mt-2 pr-6 text-xs"
        >
          <AreaChart
            data={gatewaysPerEpoch}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (
                state.isTooltipActive &&
                state.activeTooltipIndex !== undefined
              ) {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => {
              if (gatewaysPerEpoch) {
                setActiveIndex(gatewaysPerEpoch.length - 1);
              }
            }}
          >
            <defs>
              <linearGradient
                id="gatewaysColorGradient"
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
            <YAxis axisLine={false} tickLine={false} />

            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="totalEligibleGateways"
              stroke="#E19EE5"
              strokeWidth={2}
              strokeOpacity={0.2}
              fillOpacity={0.2}
              fill="url(#gatewaysColorGradient)"
              dot={(props) => {
                const { cx, cy, index } = props;
                const isActive = index === activeIndex;

                return (
                  <circle
                    key={`gateway-dot-${index}`}
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
      ) : gatewaysPerEpoch && gatewaysPerEpoch.length < 2 ? (
        <div className="m-auto pb-12 text-sm italic text-low">
          Historical trend available soon
        </div>
      ) : (
        <Placeholder className="m-auto" />
      )}
    </div>
  );
};

export default GatewaysInNetworkPanel;
