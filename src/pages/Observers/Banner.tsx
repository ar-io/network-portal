import {
  GatewayHoverIcon,
  GatewayIcon,
  ObserversBgIcon,
  ObserversConnectIcon,
  PinkArrowIcon,
  StartGatewayCubes,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import { GatewayStatus, useGatewayInfo } from '@src/hooks/useGatewayInfo';
import useObservations from '@src/hooks/useObservations';
import useObservers from '@src/hooks/useObservers';
import { useGlobalState } from '@src/store';
import { formatAddress, formatPercentage } from '@src/utils';
import { useState } from 'react';

const InfoSection = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-[48px] text-left dark:border-transparent-100-8">
      <div className="pt-[4px] text-[12px] leading-none text-low">{label}</div>
      <div className="text-nowrap text-[12px] text-mid">{value}</div>
    </div>
  );
};

const Banner = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const [loginOpen, setLoginOpen] = useState(false);
  const [startGatewayOpen, setStartGatewayOpen] = useState(false);

  const { data: observers } = useObservers();
  const { data: observations } = useObservations();

  const { gateway, gatewayStatus } = useGatewayInfo();

  const myObserver = observers?.find(
    (obs) => obs.gatewayAddress == walletAddress?.toString(),
  );
  const prescribed = myObserver != undefined;

  const prescribedStatus = prescribed
    ? observations?.reports[walletAddress?.toString() || '']
      ? 'Prescribed - Report Submitted'
      : 'Prescribed - Report Pending'
    : 'Not prescribed for this epoch';

  const numFailedGatewaysFound = myObserver
    ? observations?.reports[myObserver.gatewayAddress]
      ? Object.values(observations.failureSummaries).reduce((acc, summary) => {
          return acc + (summary.includes(myObserver.gatewayAddress) ? 1 : 0);
        }, 0)
      : 'Pending'
    : 'N/A';

  return (
    <div>
      {!walletAddress ? (
        <div>
          <button
            className="group relative h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
            onClick={() => {
              if (!walletAddress) {
                setLoginOpen(true);
              } else {
                setStartGatewayOpen(true);
              }
            }}
          >
            <div
              className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
            >
              <div className="size-full overflow-hidden rounded-xl bg-grey-800">
                <ObserversBgIcon className="relative left-[63px]  top-[31px] z-0 opacity-10" />
              </div>
            </div>
            <ObserversBgIcon className="visible absolute left-[64px] top-[32px] z-0 opacity-10  group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
              <div className="flex items-center gap-[8px]">
                <ObserversConnectIcon />
                <div className="text-gradient">Connect your wallet</div>{' '}
              </div>

              <div className="pt-[8px] text-sm text-low">
                Login to view your observer status.
              </div>
            </div>
          </button>
        </div>
      ) : gatewayStatus == GatewayStatus.NOT_FOUND ? (
        <div>
          <button
            className="group relative h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
            onClick={() => {
              setStartGatewayOpen(true);
            }}
          >
            <div
              className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
            >
              <div className="size-full overflow-hidden rounded-xl bg-grey-800">
                <StartGatewayCubes className="relative -top-px left-[63px] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute left-[64px] top-0 z-0 group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
              <div className="flex items-center gap-[8px]">
                <div className="text-gradient">Configure your gateway</div>{' '}
                <PinkArrowIcon />
              </div>

              <div className="pt-[8px] text-sm text-low">
                Configure a gateway to become an observer.
              </div>
            </div>
          </button>
        </div>
      ) : gateway ? (
        <div className="relative h-[120px] w-full overflow-hidden rounded-xl border border-grey-800">
          <div className="absolute top-0 z-10 flex size-full flex-col bg-transparent py-[24px] align-middle">
            <div className="flex items-center gap-[12px] pl-[24px]">
              <GatewayIcon className="block group-hover:hidden" />
              <GatewayHoverIcon className="hidden group-hover:block" />
              <div className="group-hover:text-gradient text-sm text-high">
                My Gateway Observer Status
              </div>
            </div>
            <div className="mt-[12px] flex pl-[6px]">
              <InfoSection
                label="Observer Address"
                value={formatAddress(gateway.observerAddress)}
              />
              <InfoSection label="Status" value={prescribedStatus} />
              {myObserver && (
                <>
                  <InfoSection
                    label="Observation Chance"
                    value={
                      myObserver
                        ? formatPercentage(myObserver.normalizedCompositeWeight)
                        : 'N/A'
                    }
                  />
                  <InfoSection
                    label="Observer Performance"
                    value={
                      myObserver
                        ? formatPercentage(myObserver.observerRewardRatioWeight)
                        : 'N/A'
                    }
                  />
                  <InfoSection
                    label="Failed Gateways"
                    value={numFailedGatewaysFound.toString()}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-[120px] w-full justify-center overflow-hidden rounded-xl bg-grey-800 ">
          <div className="h-full content-center text-center text-sm text-low">
            Loading gateway information...
          </div>
        </div>
      )}
      {loginOpen && <ConnectModal onClose={() => setLoginOpen(false)} />}
      {startGatewayOpen && (
        <StartGatewayModal onClose={() => setStartGatewayOpen(false)} />
      )}
    </div>
  );
};

export default Banner;
