import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useArNSStats from '@src/hooks/useArNSStats';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

const ArNSStatsPanel = () => {
  const { data: arnsStats } = useArNSStats();

  return (
    <div className="flex min-w-[22rem] flex-col rounded-xl border border-grey-500 px-6 py-5">
      <div className="flex items-center">
        <div className="grow text-sm text-mid">ArNS Names Purchased</div>

        {arnsStats && (
          <Tooltip
            message={
              <div>
                <div className="mb-2 font-semibold text-high">ArNS Stats</div>
                <div>
                  <div>Active Names: {arnsStats.totalActiveNames}</div>
                  <div>Returned Names: {arnsStats.totalReturnedNames}</div>
                  <div>
                    Grace Period Names: {arnsStats.totalGracePeriodNames}
                  </div>
                  <div>Reserved Names: {arnsStats.totalReservedNames}</div>
                </div>
              </div>
            }
          >
            <InfoIcon className="size-[1.125rem] text-low" />
          </Tooltip>
        )}
      </div>
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
