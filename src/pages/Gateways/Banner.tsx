import {
  BannerRightChevron,
  GatewayHoverIcon,
  GatewayIcon,
  PinkArrowIcon,
  StartGatewayCubes,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import { GatewayStatus, useGatewayInfo } from '@src/hooks/useGatewayInfo';
import { useGlobalState } from '@src/store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InfoSection = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="inline-flex h-[2.375rem] flex-col items-start justify-start gap-1 border-r px-12 text-left dark:border-transparent-100-8">
      <div className="pt-1 text-xs leading-none text-low">{label}</div>
      <div className="text-nowrap text-xs text-mid">{value}</div>
    </div>
  );
};

const Banner = () => {
  const navigate = useNavigate();

  const walletAddress = useGlobalState((state) => state.walletAddress);

  const [loginOpen, setLoginOpen] = useState(false);
  const [startGatewayOpen, setStartGatewayOpen] = useState(false);

  const { gatewayInfo, gatewayStatus } = useGatewayInfo();

  return (
    <div>
      {!walletAddress || gatewayStatus == GatewayStatus.NOT_FOUND ? (
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
                <StartGatewayCubes className="relative -top-px left-[calc(4rem-1px)] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute left-16 top-0 z-0 group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-6 align-middle">
              <div className="flex items-center gap-2">
                <div className="text-gradient">Start your own gateway</div>{' '}
                <PinkArrowIcon className="size-3" />
              </div>

              <div className="px-6 pt-2 text-sm text-low">
                By running a gateway, you become a contributor to the ecosystem
                and can earn rewards.
              </div>
            </div>
          </button>
        </div>
      ) : gatewayStatus == GatewayStatus.FOUND ? (
        <div>
          <button
            className="group relative h-fit w-full overflow-hidden rounded-xl bg-grey-800 lg:h-[7.5rem]"
            onClick={() => {
              if (walletAddress) {
                navigate(`/gateways/${walletAddress.toString()}`);
              }
            }}
          >
            <div
              className="invisible size-full rounded-xl bg-gradient-to-r
        from-gradient-primary-start to-gradient-primary-end p-px group-hover:visible"
            >
              <div className="relative size-full overflow-hidden rounded-xl bg-grey-800">
                <StartGatewayCubes className="absolute right-[calc(-.625rem-1px)] top-[calc(-.3125rem-1px)] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute right-[-.625rem] top-[-.3125rem] z-0  group-hover:invisible" />
            <BannerRightChevron className="invisible absolute right-4 top-4 group-hover:visible" />
            <div className="top-0 z-10 flex size-full flex-col bg-transparent py-6 align-middle lg:absolute">
              <div className="flex items-center gap-3 pl-6">
                <GatewayIcon className="block h-3 w-4 group-hover:hidden" />
                <GatewayHoverIcon className="hidden h-3 w-4 group-hover:block" />
                <div className="group-hover:text-gradient text-sm text-high">
                  My Gateway
                </div>
              </div>
              <div className="mt-3 flex flex-col pl-1.5 lg:flex-row">
                {gatewayInfo.map(([label, value], index) => (
                  <InfoSection key={index} label={label} value={`${value}`} />
                ))}
              </div>
            </div>
          </button>
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
