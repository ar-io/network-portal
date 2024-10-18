import Placeholder from '@src/components/Placeholder';
import useGatewaysPerEpoch from '@src/hooks/useGatewaysPerEpoch';
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

const GatewaysInNetworkPanel = () => {
  const { data: gatewaysPerEpoch } = useGatewaysPerEpoch();

  return (
    <div className="flex h-[15.675rem] min-w-[22rem] flex-col rounded-xl border border-grey-500 text-sm text-mid">
      <div className=" px-6 pt-5 text-mid">
        Gateways in the Network by Epoch
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
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Placeholder className="m-auto" />
      )}
    </div>
  );
};

export default GatewaysInNetworkPanel;
