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
    <div className="inline-flex h-[38px] flex-col items-start justify-start gap-1 border-r px-[48px] text-left dark:border-transparent-100-8">
      <div className="pt-[4px] text-[12px] leading-none text-low">{label}</div>
      <div className="text-nowrap text-[12px] text-mid">{value}</div>
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
                <StartGatewayCubes className="relative -top-px left-[63px] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute left-[64px] top-0 z-0 group-hover:invisible" />
            <div className="absolute top-0 z-10 flex size-full flex-col items-center justify-center bg-transparent py-[24px] align-middle">
              <div className="flex items-center gap-[8px]">
                <div className="text-gradient">Start your own gateway</div>{' '}
                <PinkArrowIcon />
              </div>

              <div className="pt-[8px] text-sm text-low">
                By running a gateway, you become a contributor to the ecosystem and can earn rewards.
              </div>
            </div>
          </button>
        </div>
      ) : gatewayStatus == GatewayStatus.FOUND ? (
        <div>
          <button
            className="group relative h-[120px] w-full overflow-hidden rounded-xl bg-grey-800"
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
                <StartGatewayCubes className="absolute right-[-11px] top-[-6px] z-0" />
              </div>
            </div>
            <StartGatewayCubes className="visible absolute right-[-10px] top-[-5px] z-0  group-hover:invisible" />
            <BannerRightChevron className="invisible absolute right-[16px] top-[16px] group-hover:visible" />
            <div className="absolute top-0 z-10 flex size-full flex-col bg-transparent py-[24px] align-middle">
              <div className="flex items-center gap-[12px] pl-[24px]">
                <GatewayIcon className="block group-hover:hidden" />
                <GatewayHoverIcon className="hidden group-hover:block" />
                <div className="group-hover:text-gradient text-sm text-high">
                  My Gateway
                </div>
              </div>
              <div className="mt-[12px] flex pl-[6px]">
                {gatewayInfo.map(([label, value], index) => (
                  <InfoSection key={index} label={label} value={`${value}`} />
                ))}
              </div>
            </div>
          </button>
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
