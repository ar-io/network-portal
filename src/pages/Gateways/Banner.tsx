import {
  BannerRightChevron,
  GatewayHoverIcon,
  GatewayIcon,
  LinkArrowIcon,
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
    <div
      className={
        walletAddress && gatewayStatus === GatewayStatus.FOUND
          ? 'sticky top-4 z-10'
          : ''
      }
    >
      {walletAddress && gatewayStatus === GatewayStatus.FOUND ? (
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
        <div className="relative h-auto w-full overflow-hidden rounded-xl bg-grey-800 p-6">
          <StartGatewayCubes className="absolute right-[-0.5rem] top-[-0.5rem] z-0" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-gradient text-lg font-medium">
                Start Earning Rewards
              </div>
              <PinkArrowIcon className="size-3" />
            </div>

            <div className="text-xs text-mid mb-4">
              Join 750+ gateways earning ARIO tokens
            </div>

            <div className="text-sm text-low mb-6 space-y-2">
              <div>1. Set up your gateway (10 mins)</div>
              <div>2. Buy and configure a DNS name</div>
              <div>3. Join the network and start earning</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://docs.ar.io/build/run-a-gateway"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-grey-600 bg-grey-700 text-sm text-high hover:bg-grey-600 transition-colors"
              >
                View Setup Guide
                <LinkArrowIcon className="h-3 w-3" />
              </a>

              <button
                onClick={() => {
                  if (!walletAddress) {
                    setLoginOpen(true);
                  } else {
                    setStartGatewayOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end text-sm text-grey-900 font-medium hover:opacity-90 transition-opacity"
              >
                {!walletAddress ? 'Connect Wallet to Join' : 'Join Network'}
                <PinkArrowIcon
                  className="size-3 text-grey-900"
                  style={{ filter: 'brightness(0)' }}
                />
              </button>
            </div>
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
