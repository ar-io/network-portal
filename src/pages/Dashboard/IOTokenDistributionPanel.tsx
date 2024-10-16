import { AoTokenSupplyData, mIOToken } from '@ar.io/sdk';
import Placeholder from '@src/components/Placeholder';
import useTokenSupply from '@src/hooks/useTokenSupply';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, Text } from 'recharts';

const TOTAL_IO = 1_000_000_000;

type IOCategory =
  | 'Protocol Balance'
  | 'Operator Stake'
  | 'Delegated Stake'
  | 'Pending Withdrawal'
  | 'In Circulation'
  | 'Locked Supply';

type IODistribution = { name: IOCategory; value: number }[];

const calculateIODistribution = (
  tokenSupply: AoTokenSupplyData,
): IODistribution => {
  return [
    {
      name: 'Protocol Balance',
      value: new mIOToken(tokenSupply.protocolBalance).toIO().valueOf(),
    },
    {
      name: 'Operator Stake',
      value: new mIOToken(tokenSupply.staked).toIO().valueOf(),
    },
    {
      name: 'Delegated Stake',
      value: new mIOToken(tokenSupply.delegated).toIO().valueOf(),
    },
    {
      name: 'Pending Withdrawal',
      value: new mIOToken(tokenSupply.withdrawn).toIO().valueOf(),
    },
    {
      name: 'In Circulation',
      value: new mIOToken(tokenSupply.circulating).toIO().valueOf(),
    },
    {
      name: 'Locked Supply',
      value: new mIOToken(tokenSupply.locked).toIO().valueOf(),
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
      data && activeIndex !== undefined ? data[activeIndex].value : TOTAL_IO,
    ),
  );

  return (
    <div className="w-[22rem] rounded-xl border border-grey-500">
      <div className="text-gradient px-5 pt-5 text-lg">IO Token</div>
      <div className="relative h-[120px] w-[352px]">
        {data ? (
          <>
            <PieChart width={352} height={120}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={60}
                stroke="none"
                paddingAngle={2}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
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
      <div className="mt-6 grid w-full grid-cols-6 gap-2 rounded-b-xl bg-containerL3 p-2 py-4">
        {data?.map((entry, index) => {
          return (
            <div
              key={index}
              className="flex cursor-pointer gap-1"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div
                className={`size-2 rounded-sm ${index == activeIndex ? 'bg-[#E19EE5f0]' : 'bg-[#E19EE520]'}`}
              />
              <div className="grow text-[.5rem] text-low">{entry.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IOTokenDistributionPanel;
