import { TokenSupplyData, mARIOToken } from '@ar.io/sdk/web';
import Placeholder from '@src/components/Placeholder';
import useTokenSupply from '@src/hooks/useTokenSupply';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Text } from 'recharts';

const TOTAL_IO = 1_000_000_000;

type IOCategory =
  | 'Protocol Balance'
  | 'Actively Staked'
  | 'Pending Withdrawal'
  | 'Liquid'
  | 'Locked';

type IODistribution = { name: IOCategory; value: number }[];

/**
 * One step per slice, in the brand accent's own hue (297deg).
 *
 * Every slice used to be the same pink at 20% opacity, lifting to 50% on
 * hover — in the chart AND in the legend. So colour encoded which slice your
 * cursor was over, not which slice it was, and the legend could not identify
 * anything without hovering it first.
 *
 * A supply breakdown is parts of one quantity, so this is a sequential ramp
 * rather than five competing hues: monotonic in lightness, and every step
 * clears 3:1 against the page (darkest is 3.04:1). Slices are ordered by size,
 * so the ramp reads largest-to-smallest rather than being an arbitrary
 * assignment.
 */
const SUPPLY_RAMP = [
  '#E4B1E7',
  '#D68BDA',
  '#C964CE',
  '#BB3DC2',
  '#96319B',
] as const;

const calculateIODistribution = (
  tokenSupply: TokenSupplyData,
): IODistribution => {
  const distribution: IODistribution = [
    {
      name: 'Protocol Balance',
      value: new mARIOToken(tokenSupply.protocolBalance).toARIO().valueOf(),
    },
    {
      name: 'Actively Staked',
      value: new mARIOToken(tokenSupply.staked + tokenSupply.delegated)
        .toARIO()
        .valueOf(),
    },
    {
      name: 'Pending Withdrawal',
      value: new mARIOToken(tokenSupply.withdrawn).toARIO().valueOf(),
    },
    {
      name: 'Liquid',
      value: new mARIOToken(tokenSupply.circulating).toARIO().valueOf(),
    },
    {
      name: 'Locked',
      value: new mARIOToken(tokenSupply.locked).toARIO().valueOf(),
    },
  ];

  // Largest first, so the ramp above reads as a magnitude scale rather than an
  // arbitrary assignment of five pinks.
  return distribution.sort((a, b) => b.value - a.value);
};

const IOTokenDistributionPanel = () => {
  const [data, setData] = useState<IODistribution>();

  const { data: tokenSupply } = useTokenSupply();

  const ticker = useGlobalState((state) => state.ticker);

  const [activeIndex, setActiveIndex] = useState<number>();

  useEffect(() => {
    setData(tokenSupply ? calculateIODistribution(tokenSupply) : undefined);
  }, [tokenSupply]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const ioDisplayValue = formatWithCommas(
    Math.floor(
      data && activeIndex !== undefined
        ? data[activeIndex].value
        : tokenSupply?.total
          ? new mARIOToken(tokenSupply.total).toARIO().valueOf()
          : TOTAL_IO,
    ),
  );

  return (
    <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
      <div className="text-gradient px-5 pt-5 text-sm">
        {data && activeIndex !== undefined
          ? data[activeIndex].name
          : ticker
            ? 'Token Supply'
            : ''}
      </div>
      <div className="relative h-48 w-full grow">
        {data ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  innerRadius={46}
                  outerRadius={62}
                  stroke="none"
                  paddingAngle={2}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SUPPLY_RAMP[index % SUPPLY_RAMP.length]}
                      // Hover now dims the others rather than being the only
                      // thing that distinguishes them.
                      fillOpacity={
                        activeIndex === undefined || activeIndex === index
                          ? 1
                          : 0.35
                      }
                    />
                  ))}
                </Pie>
                <Text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#E19EE5"
                  fontSize={20}
                >
                  Test
                </Text>
              </PieChart>
            </ResponsiveContainer>
            {/* Beneath the ring, not centred inside it. "1,000,000,000" is
                wider than the donut's hole at any size that keeps the figure
                readable, so an absolutely-centred overlay crossed the ring on
                both sides. That went unnoticed while every slice was the same
                near-transparent pink; with the slices distinguishable it reads
                as a collision. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center">
              <div className="text-gradient flex items-baseline gap-1 text-center">
                <div className="text-2xl font-semibold">{ioDisplayValue}</div>
                <div className="text-xs">{ticker}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex size-full">
            <Placeholder className="m-auto h-4" />
          </div>
        )}
      </div>
      <div className="grid w-full grid-cols-5 gap-2 rounded-b-xl bg-containerL3 p-2">
        {data?.map((entry, index) => {
          return (
            <div
              key={index}
              className="flex cursor-pointer gap-1"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div
                className="mt-1 size-2 min-w-2 rounded-full"
                style={{
                  backgroundColor: SUPPLY_RAMP[index % SUPPLY_RAMP.length],
                  opacity:
                    activeIndex === undefined || activeIndex === index
                      ? 1
                      : 0.35,
                }}
              />
              <div className="grow text-[.675rem] text-low">{entry.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IOTokenDistributionPanel;
