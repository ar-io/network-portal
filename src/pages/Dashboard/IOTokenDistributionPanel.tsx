import { AoTokenSupplyData, mARIOToken } from '@ar.io/sdk/web';
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

const calculateIODistribution = (
  tokenSupply: AoTokenSupplyData,
): IODistribution => {
  return [
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
    <div className="flex w-full flex-col rounded-xl border border-grey-500 lg:w-[22rem]">
      <div className="text-gradient px-5 pt-5 text-sm">
        {data && activeIndex !== undefined
          ? data[activeIndex].name
          : ticker
            ? `${ticker} Token`
            : ''}
      </div>
      <div className="relative h-48 w-full grow lg:w-[352px]">
        {data ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={352} height={120}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  stroke="none"
                  paddingAngle={2}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeIndex ? '#E19EE580' : '#E19EE520'}
                    />
                  ))}
                </Pie>
                <Text
                  x={176}
                  y={60}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#E19EE5"
                  fontSize={20}
                >
                  Test
                </Text>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-gradient flex text-center ">
                <div className="text-3xl font-semibold">{ioDisplayValue}</div>
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
      <div className="grid w-full grid-cols-5 gap-2 rounded-b-xl bg-containerL3 p-2 py-4">
        {data?.map((entry, index) => {
          return (
            <div
              key={index}
              className="flex cursor-pointer gap-1"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div
                className={`mt-1 size-2 min-w-2 rounded-full ${index === activeIndex ? 'bg-[#E19EE5f0]' : 'bg-[#E19EE520]'}`}
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
