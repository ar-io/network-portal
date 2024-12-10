import Placeholder from '@src/components/Placeholder';
import useArNSStats from '@src/hooks/useArNSStats';
import { formatWithCommas } from '@src/utils';

const ArNSStatsPanel = () => {
  const { data: arnsStats } = useArNSStats();

  return (
    <div className="flex min-w-[22rem] flex-col rounded-xl border border-grey-500 px-6 py-5">
      <div className=" text-sm text-mid">ArNS Names Purchased</div>
      <div className="self-center px-24 py-6 text-center text-[2.625rem]">
        {arnsStats ? (
          formatWithCommas(arnsStats.namesPurchased)
        ) : (
          <Placeholder />
        )}
      </div>
      <div className="flex h-full justify-between align-bottom font-bold text-high">
        <div className="flex flex-col place-items-start text-left text-xs">
          <div className="grow" />
          {arnsStats ? (
            <>
              <div>{arnsStats.demandFactor.toFixed(4)}</div>
              <div>Demand Factor</div>
            </>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    </div>
  );
};

export default ArNSStatsPanel;
