import Placeholder from '@src/components/Placeholder';
import useAllBalances from '@src/hooks/useAllBalances';
import { useGlobalState } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const TOTAL_SUPPLY = 1_000_000_000;
const BRIDGE_BALANCE_ADDRESS = 'mFRKcHsO6Tlv2E2wZcrcbv3mmzxzD7vYPbyybI3KCVA';

interface BalanceData {
  name: string;
  value: number;
  percentage: number;
  address: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md bg-containerL3 p-3 shadow-lg">
        <p className="text-sm font-semibold text-high">{data.name}</p>
        <p className="text-xs text-mid">
          {formatWithCommas(data.value)} {payload[0].payload.ticker}
        </p>
        <p className="text-xs text-low">
          {formatPercentage(data.percentage)} of total supply
        </p>
        {data.address && (
          <p className="mt-1 break-all text-xs font-mono text-low opacity-70">
            {data.address}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const BalanceFragmentationChart = () => {
  const [data, setData] = useState<BalanceData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>();
  const { data: allBalances, isLoading } = useAllBalances();
  const ticker = useGlobalState((state) => state.ticker);
  const arioProcessId = useGlobalState(
    (state) => state.arIOReadSDK.process.processId,
  );

  useEffect(() => {
    if (allBalances && allBalances.length > 0) {
      const protocolBalance = allBalances.find(
        (b) => b.address === arioProcessId,
      );
      const protocolValue = protocolBalance?.arioBalance || 0;

      const bridgeBalance = allBalances.find(
        (b) => b.address === BRIDGE_BALANCE_ADDRESS,
      );
      const bridgeValue = bridgeBalance?.arioBalance || 0;

      // Create balance data array
      const balanceData: BalanceData[] = [];

      // Add protocol balance first
      if (protocolValue > 0) {
        balanceData.push({
          name: 'Protocol Balance',
          value: protocolValue,
          percentage: protocolValue / TOTAL_SUPPLY,
          address: arioProcessId,
        });
      }

      // Add bridge balance
      if (bridgeValue > 0) {
        balanceData.push({
          name: 'Bridge Balance',
          value: bridgeValue,
          percentage: bridgeValue / TOTAL_SUPPLY,
          address: BRIDGE_BALANCE_ADDRESS,
        });
      }

      // Add individual balances for top holders (excluding protocol and bridge)
      const topHolders = allBalances
        .filter(
          (b) =>
            b.address !== arioProcessId && b.address !== BRIDGE_BALANCE_ADDRESS,
        )
        .slice(0, 18); // Show top 18 non-protocol/bridge addresses

      topHolders.forEach((holder, index) => {
        balanceData.push({
          name: `Wallet ${index + 1}`,
          value: holder.arioBalance,
          percentage: holder.arioBalance / TOTAL_SUPPLY,
          address: holder.address,
        });
      });

      // Add "Others" category if there are more addresses
      const excludedCount = (protocolBalance ? 1 : 0) + (bridgeBalance ? 1 : 0);
      const othersCount =
        allBalances.length - topHolders.length - excludedCount;
      if (othersCount > 0) {
        const othersTotal = allBalances
          .filter(
            (b) =>
              b.address !== arioProcessId &&
              b.address !== BRIDGE_BALANCE_ADDRESS,
          )
          .slice(18)
          .reduce((sum, b) => sum + b.arioBalance, 0);

        balanceData.push({
          name: `Others (${othersCount} addresses)`,
          value: othersTotal,
          percentage: othersTotal / TOTAL_SUPPLY,
          address: '',
        });
      }

      setData(balanceData);
    }
  }, [allBalances, arioProcessId]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const centerValue =
    data && activeIndex !== undefined
      ? formatPercentage(data[activeIndex].percentage)
      : data.length > 0
        ? `${formatWithCommas(allBalances?.length || 0)} holders`
        : '0 holders';

  const centerLabel =
    data && activeIndex !== undefined
      ? data[activeIndex].name
      : 'Total Addresses';

  return (
    <div className="flex w-full flex-col rounded-xl border border-grey-500">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-gradient text-sm font-semibold">
          Token Balance Distribution
        </h3>
        <p className="mt-1 text-xs text-low">
          {formatWithCommas(TOTAL_SUPPLY)} {ticker} total supply
        </p>
      </div>

      <div className="relative h-64 w-full p-5">
        {isLoading ? (
          <div className="flex size-full items-center justify-center">
            <Placeholder className="h-4" />
          </div>
        ) : data.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  stroke="none"
                  paddingAngle={2}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.address === arioProcessId
                          ? index === activeIndex
                            ? '#E19EE580'
                            : '#E19EE520'
                          : entry.address === BRIDGE_BALANCE_ADDRESS
                            ? index === activeIndex
                              ? '#FF8C00'
                              : '#FF8C0050'
                            : index === activeIndex
                              ? '#E19EE540'
                              : '#E19EE510'
                      }
                      {...{ ticker }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold text-high">
                {centerValue}
              </div>
              <div className="text-xs text-mid">{centerLabel}</div>
            </div>
          </>
        ) : (
          <div className="flex size-full items-center justify-center">
            <p className="text-sm text-mid">No balance data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceFragmentationChart;
