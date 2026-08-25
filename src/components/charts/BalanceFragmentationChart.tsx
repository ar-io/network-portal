import Placeholder from '@src/components/Placeholder';
import useAllBalances from '@src/hooks/useAllBalances';
import { useGlobalState, useSettings } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { sequentialRamp } from '@src/utils/chartRamp';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const TOTAL_SUPPLY = 1_000_000_000;

/**
 * The bridge is not a holder, so it does not belong on the holder ramp. Uses
 * the palette's reserved warning step rather than the ad-hoc orange it had,
 * which was close enough to that token to look like a mistake.
 */
const BRIDGE_COLOR = '#ffb938';

/**
 * The pooled remainder is thousands of addresses, not one. Giving it a ramp
 * step would put a large slice at whatever shade its array position happened
 * to land on, breaking the one thing the ramp is supposed to say — that shade
 * tracks rank among individual holders.
 */
const AGGREGATE_COLOR = '#3b3b45';

interface BalanceData {
  name: string;
  value: number;
  /** The pooled remainder, which is not a holder and must not sit on the ramp. */
  isAggregate?: boolean;
  percentage: number;
  address: string;
  ticker?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md bg-containerL3 p-3 shadow-lg">
        <p className="text-sm font-semibold text-high">{data.name}</p>
        <p className="text-xs text-mid">
          {formatWithCommas(data.value)} {data.ticker}
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
  const bridgeBalanceAddress = useSettings(
    (state) => state.bridgeBalanceAddress,
  );

  // Ramp only over the individual holders, which are already ordered
  // largest-first, so shade tracks rank. The bridge and the pooled remainder
  // are not holders and get their own colours.
  const rampLength = useMemo(
    () =>
      data.filter((d) => !d.isAggregate && d.address !== bridgeBalanceAddress)
        .length,
    [data, bridgeBalanceAddress],
  );
  const ramp = useMemo(() => sequentialRamp(rampLength), [rampLength]);

  useEffect(() => {
    if (allBalances && allBalances.length > 0) {
      const bridgeBalance = allBalances.find(
        (b) => b.address === bridgeBalanceAddress,
      );
      const bridgeValue = bridgeBalance?.arioBalance || 0;

      // Create balance data array
      const balanceData: BalanceData[] = [];

      // Add bridge balance
      if (bridgeValue > 0) {
        balanceData.push({
          name: 'Bridge Balance',
          value: bridgeValue,
          percentage: bridgeValue / TOTAL_SUPPLY,
          address: bridgeBalanceAddress,
          ticker,
        });
      }

      // Add individual balances for top holders (excluding bridge)
      const topHolders = allBalances
        .filter((b) => b.address !== bridgeBalanceAddress)
        .slice(0, 19);

      topHolders.forEach((holder, index) => {
        balanceData.push({
          name: `Wallet ${index + 1}`,
          value: holder.arioBalance,
          percentage: holder.arioBalance / TOTAL_SUPPLY,
          address: holder.address,
          ticker,
        });
      });

      // Add "Others" category if there are more addresses
      const excludedCount = bridgeBalance ? 1 : 0;
      const othersCount =
        allBalances.length - topHolders.length - excludedCount;
      if (othersCount > 0) {
        const othersTotal = allBalances
          .filter((b) => b.address !== bridgeBalanceAddress)
          .slice(19)
          .reduce((sum, b) => sum + b.arioBalance, 0);

        balanceData.push({
          name: `Others (${othersCount} addresses)`,
          value: othersTotal,
          percentage: othersTotal / TOTAL_SUPPLY,
          address: '',
          ticker,
          isAggregate: true,
        });
      }

      setData(balanceData);
    }
  }, [allBalances, bridgeBalanceAddress, ticker]);

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
          Balance Distribution
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
                      // Identity comes from the ramp position, not from hover.
                      // Every slice used to sit at 6% opacity and lift to 25%
                      // under the cursor, so colour encoded which slice you
                      // were pointing at rather than which slice it was, and
                      // the legend could identify nothing on its own.
                      fill={
                        entry.address === bridgeBalanceAddress
                          ? BRIDGE_COLOR
                          : entry.isAggregate
                            ? AGGREGATE_COLOR
                            : (ramp[
                                index -
                                  (data[0]?.address === bridgeBalanceAddress
                                    ? 1
                                    : 0)
                              ] ?? AGGREGATE_COLOR)
                      }
                      fillOpacity={
                        activeIndex === undefined || activeIndex === index
                          ? 1
                          : 0.35
                      }
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
