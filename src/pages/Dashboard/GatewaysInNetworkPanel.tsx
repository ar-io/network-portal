import EpochSelector from '@src/components/EpochSelector';
import Placeholder from '@src/components/Placeholder';
import Streak from '@src/components/Streak';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useGatewaysPerEpoch from '@src/hooks/useGatewaysPerEpoch';
import useGatewaysPerEpochWithCount from '@src/hooks/useGatewaysPerEpochWithCount';
import { useEffect, useMemo, useState } from 'react';
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
    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label}`}</p>
        <p>{`Number of Gateways: ${Number(payload[0].value)}`}</p>
      </div>
    );
  }

  return null;
};

interface GatewaysInNetworkPanelProps {
  epochCount: number;
  onEpochCountChange: (value: number) => void;
}

const GatewaysInNetworkPanel = ({
  epochCount,
  onEpochCountChange,
}: GatewaysInNetworkPanelProps) => {
  const { data: gatewaysPerEpoch } = useGatewaysPerEpochWithCount(epochCount);
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
      setPercentageChange(percentageChange || undefined);
    }
  }, [activeIndex, gatewaysPerEpoch]);

  return (
    <div className="flex h-72 flex-col rounded-xl border border-grey-500 text-sm text-mid lg:min-w-[22rem]">
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-mid">Gateways in the Network by Epoch</span>
        <EpochSelector value={epochCount} onChange={onEpochCountChange} />
      </div>
      <div className="flex gap-2">
        <div className="py-6 pl-6 text-[2.625rem] text-high">
          {gatewaysPerEpoch &&
            activeIndex !== undefined &&
            gatewaysPerEpoch[activeIndex] &&
            gatewaysPerEpoch[activeIndex].totalEligibleGateways}
        </div>
        {percentageChange && (
          <div className="flex h-full flex-col justify-end pb-4">
            <Streak streak={percentageChange} fixedDigits={2} rightLabel="%" />
          </div>
        )}
      </div>
      {gatewaysPerEpoch ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          className="mb-5 mt-2 pr-6 text-xs"
        >
          <AreaChart
            data={gatewaysPerEpoch}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setActiveIndex(state.activeTooltipIndex);
              } else {
                setActiveIndex(gatewaysPerEpoch.length - 1);
              }
            }}
            onMouseLeave={() => setActiveIndex(gatewaysPerEpoch.length - 1)}
          >
            <defs>
              <linearGradient
                id="gatewaysColorGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#DF9BE8" stopOpacity={0.125} />
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
              stroke="white"
              fillOpacity={1}
              fill="url(#gatewaysColorGradient)"
              activeDot={{ r: 3 }} // This will always show the dot at the activeIndex
              dot={(props) => {
                // eslint-disable-next-line react/prop-types
                const { cx, cy, index } = props;
                if (index === activeIndex) {
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      stroke="white"
                      strokeWidth={0}
                      fill="white"
                    />
                  );
                }
                return <></>;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : epochSettings && !epochSettings.hasEpochZeroStarted ? (
        <div className="m-auto pb-12 text-sm italic text-low">
          Awaiting first epoch...
        </div>
      ) : (
        <Placeholder className="m-auto" />
      )}
    </div>
  );
};

export default GatewaysInNetworkPanel;
