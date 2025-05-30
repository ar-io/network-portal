import Button from '@src/components/Button';
import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useArNSStats from '@src/hooks/useArNSStats';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useHostGatewayDomain from '@src/hooks/useHostGatewayDomain';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

const ArNSStatsPanel = () => {
  const { data: epochSettings } = useEpochSettings();
  const { data: arnsStats } = useArNSStats();
  const { data: hostGatewayDomain } = useHostGatewayDomain();

  return (
    <div className="flex min-w-[22rem] flex-col rounded-xl border border-grey-500 px-6 py-5">
      <div className="flex items-center">
        <div className="flex grow items-center gap-2 text-sm text-mid">
          ArNS Names Purchased
          {arnsStats && (
            <Tooltip
              message={
                <div>
                  <div className="mb-2 font-semibold text-high">ArNS Stats</div>
                  <div>
                    <div>Names Purchased: {arnsStats.namesPurchased}</div>
                    <div>Returned Names: {arnsStats.totalReturnedNames}</div>
                    <div>
                      Grace Period Names: {arnsStats.totalGracePeriodNames}
                    </div>
                  </div>
                </div>
              }
            >
              <InfoIcon className="size-[1.125rem] text-low" />
            </Tooltip>
          )}
        </div>

        <Button
          className="max-h-6 text-xs"
          // icon={<BinocularsIcon className="size-3" />}
          title={'ArNS.app'}
          text={'Open ArNS app'}
          active={true}
          onClick={() => {
            const arnsUrl = hostGatewayDomain
              ? `https://arns.${hostGatewayDomain}`
              : 'https://arns.app';
            window.open(arnsUrl, '_blank', 'noopener,noreferrer');
          }}
        />
      </div>
      <div className="self-center px-24 py-6 text-center text-[2.625rem]">
        {arnsStats ? (
          formatWithCommas(arnsStats.namesPurchased)
        ) : epochSettings && !epochSettings.hasEpochZeroStarted ? (
          <div className="text-sm italic text-low">Awaiting first epoch...</div>
        ) : (
          <div className="h-[5.125rem]">
            <Placeholder />
          </div>
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
            epochSettings &&
            epochSettings.hasEpochZeroStarted && <Placeholder />
          )}
        </div>
      </div>
    </div>
  );
};

export default ArNSStatsPanel;
