import { Popover } from '@headlessui/react';
import { useGlobalState } from '@src/store';
import { formatBalance, formatWalletAddress } from '@src/utils';
import { forwardRef, useState } from 'react';
import Button, { ButtonType } from './Button';
import {
  ConnectIcon,
  GearIcon,
  LogoutIcon,
  StakingIcon,
  WalletIcon,
} from './icons';
import ConnectModal from './modals/ConnectModal';

// eslint-disable-next-line react/display-name
const CustomPopoverButton = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Button
      forwardRef={ref}
      buttonType={ButtonType.PRIMARY}
      icon={<ConnectIcon />}
      title="Profile"
      {...props}
    />
  );
});

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const walletStateInitialized = useGlobalState(
    (state) => state.walletStateInitialized,
  );

  const wallet = useGlobalState((state) => state.wallet);
  const balances = useGlobalState((state) => state.balances);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const walletAddress = useGlobalState((state) => state.walletAddress);

  return walletAddress ? (
    <Popover className="relative">
      <Popover.Button as={CustomPopoverButton} />

      <Popover.Panel
        className="absolute right-0 z-50 mt-[10px] w-[240px] 
      rounded-[12px] border border-grey-800 bg-grey-1000 px-[16px] text-sm shadow-md"
      >
        <div className="flex gap-[8px] py-[20px]">
          <WalletIcon />
          <div className="text-sm text-high">
            {formatWalletAddress(walletAddress.toString())}
          </div>
        </div>
        <div className="rounded-[6px] border border-grey-800 py-[12px]">
          <div className="px-[16px] text-xs text-low">IO Balance</div>
          <div className="border-b border-grey-800 px-[16px] pb-[12px] pt-[4px] text-high">
            {formatBalance(balances.io)}
          </div>
          <div className="px-[16px] pt-[12px] text-xs text-low">AR Balance</div>
          <div className="px-[16px] pt-[4px] text-high">
            {formatBalance(balances.ar)}
          </div>
        </div>
        <div className="flex flex-col gap-[12px] py-[12px] text-mid">
          <button className="flex items-center gap-[8px]">
            <GearIcon /> Gateway Management
          </button>
          <button className="flex items-center gap-[8px]">
            <StakingIcon /> Delegated Staking
          </button>
          <button
            className="flex items-center gap-[8px]"
            title="Logout"
            onClick={async () => {
              await wallet?.disconnect();
              updateWallet(undefined, undefined);
            }}
          >
            <LogoutIcon /> Logout
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  ) : walletStateInitialized ? (
    <div>
      <Button
        buttonType={ButtonType.PRIMARY}
        icon={<ConnectIcon />}
        title="Connect"
        text="Connect"
        onClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <ConnectModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  ) : (
    <div></div>
  );
};
export default Profile;
