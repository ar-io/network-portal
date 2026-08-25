import ProtocolParametersCard from '@src/components/ProtocolParametersCard';
import Tooltip from '@src/components/Tooltip';
import {
  BannerRightChevron,
  GatewayHoverIcon,
  GatewayIcon,
  InfoIcon,
  LinkArrowIcon,
  PinkArrowIcon,
  StartGatewayCubes,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StartGatewayModal from '@src/components/modals/StartGatewayModal';
import { GatewayStatus, useGatewayInfo } from '@src/hooks/useGatewayInfo';
import { useProtocolParameters } from '@src/hooks/useProtocolParameters';
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
  const ticker = useGlobalState((state) => state.ticker);
  const { parameters } = useProtocolParameters('operator');

  return (
    <div>
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
          {/* An operator does not see the join card, so the same limits reach
              them here — leave period and failed-epoch ceiling matter more
              once you are already running. */}
          <div className="mt-6">
            <ProtocolParametersCard variant="operator" />
          </div>
        </div>
      ) : (
        <div className="relative h-auto w-full overflow-hidden rounded-xl bg-grey-800 p-6">
          <StartGatewayCubes className="absolute right-[-0.5rem] top-[-0.5rem] z-0" />

          <div className="relative z-10">
            <div className="mb-1 flex items-center gap-2">
              <div className="text-gradient text-lg font-medium">
                Join the Permanent Cloud and Start Earning Rewards
              </div>
              <PinkArrowIcon className="size-3 shrink-0" />
            </div>

            <div className="mb-5 max-w-2xl text-xs text-mid">
              Run a gateway that serves the network&apos;s data, and earn{' '}
              {ticker} for the work it does.
            </div>

            {/* Steps and requirements side by side: what to do, and what it
                takes. They were two separate cards, which meant a prospective
                operator read the three steps without ever seeing the 20,000
                ARIO floor that governs whether step three can succeed. */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
              <div className="flex shrink-0 flex-col justify-between gap-6 lg:w-[24rem]">
                <ol className="flex flex-col gap-2 text-sm text-low">
                  <li>1. Set up your gateway (10 mins)</li>
                  <li>2. Buy and configure a DNS name</li>
                  <li>3. Join the network and start earning</li>
                </ol>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://docs.ar.io/build/run-a-gateway"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-grey-600 bg-grey-700 px-4 py-2 text-sm text-high transition-colors hover:bg-grey-600"
                  >
                    Setup Guide
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
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end px-4 py-2 text-sm font-medium text-grey-900 transition-opacity hover:opacity-90"
                  >
                    {!walletAddress ? 'Connect Wallet to Join' : 'Join Network'}
                    <PinkArrowIcon
                      className="size-3 text-grey-900"
                      style={{ filter: 'brightness(0)' }}
                    />
                  </button>
                </div>
              </div>

              <div className="min-w-0 grow border-t border-transparent-100-8 pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm text-high">What it takes</span>
                  <span className="text-xs text-low">
                    set by the protocol, not by us
                  </span>
                </div>
                {parameters ? (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    {parameters.map(({ label, value, tooltip }) => (
                      <div key={label} className="flex min-w-0 flex-col gap-1">
                        <dt className="flex items-center gap-1 text-xs leading-none text-low">
                          <span className="truncate">{label}</span>
                          <Tooltip message={tooltip}>
                            <InfoIcon className="size-3.5 shrink-0 text-low" />
                          </Tooltip>
                        </dt>
                        <dd className="text-sm text-high">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="h-2.5 w-20 animate-pulse rounded bg-grey-700" />
                        <div className="h-3.5 w-16 animate-pulse rounded bg-grey-700" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
