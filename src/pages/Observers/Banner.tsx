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
    <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-12 text-left dark:border-transparent-100-8">
      <div className="pt-1 text-xs leading-none text-low">{label}</div>
      <div className="text-nowrap text-xs text-mid">{value}</div>
    </div>
  );
};

const Banner = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const [loginOpen, setLoginOpen] = useState(false);
  const [startGatewayOpen, setStartGatewayOpen] = useState(false);

  const { data: observers } = useObservers(currentEpoch);
  const { data: observations } = useObservations(currentEpoch);

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
            className="group relative h-[7.5rem] w-full overflow-hidden rounded-xl bg-grey-800"
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
                <ObserversBgIcon className="relative left-[calc(4rem-1px)]  top-[calc(2rem-1px)] z-0 opacity-10" />
              </div>
            </div>
            <ObserversBgIcon className="visible absolute left-16 top-8 z-0 opacity-10  group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-6 align-middle">
              <div className="flex items-center gap-2">
                <ObserversConnectIcon className="size-4" />
                <div className="text-gradient">Connect your wallet</div>{' '}
              </div>

              <div className="pt-2 text-sm text-low">
                Login to view your observer status.
              </div>
            </div>
          </button>
        </div>
      ) : gatewayStatus == GatewayStatus.NOT_FOUND ? (
        <div>
          <button
            className="group relative h-[7.5rem] w-full overflow-hidden rounded-xl bg-grey-800"
            onClick={() => {
              setStartGatewayOpen(true);
            }}
          >
            <div
              className="invisible size-full rounded-xl
       bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
            >
              <div className="size-full overflow-hidden rounded-xl bg-grey-800">
                <StartGatewayCubes className="relative -top-px left-[calc(4rem-1px)] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute left-16 top-0 z-0 group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-6 align-middle">
              <div className="flex items-center gap-2">
                <div className="text-gradient">Configure your gateway</div>{' '}
                <PinkArrowIcon className="size-3" />
              </div>

              <div className="pt-2 text-sm text-low">
                Configure a gateway to become an observer.
              </div>
            </div>
          </button>
        </div>
      ) : gateway ? (
        <div className="relative h-[7.5rem] w-full overflow-hidden rounded-xl border border-grey-800">
          <div className="absolute top-0 z-10 flex size-full flex-col bg-transparent py-6 align-middle">
            <div className="flex items-center gap-3 pl-6">
              <GatewayIcon className="block h-3 w-4 group-hover:hidden" />
              <GatewayHoverIcon className="hidden h-3 w-4 group-hover:block" />
              <div className="group-hover:text-gradient text-sm text-high">
                My Gateway Observer Status
              </div>
            </div>
            <div className="mt-3 flex pl-1.5">
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
        <div className="relative h-[7.5rem] w-full justify-center overflow-hidden rounded-xl bg-grey-800 ">
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
