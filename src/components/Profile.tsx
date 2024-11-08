/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { Popover } from '@headlessui/react';
import { useGlobalState } from '@src/store';
import { formatBalance, formatWalletAddress } from '@src/utils';
import { forwardRef, useState } from 'react';
import Button, { ButtonType } from './Button';
import CopyButton from './CopyButton';
import Tooltip from './Tooltip';
import {
  ClockRewindIcon,
  ConnectIcon,
  LinkArrowIcon,
  LogoutIcon,
  WalletIcon,
} from './icons';
import ConnectModal from './modals/ConnectModal';
import useBalances from '@src/hooks/useBalances';
import Placeholder from './Placeholder';

// eslint-disable-next-line react/display-name
const CustomPopoverButton = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Button
      forwardRef={ref}
      buttonType={ButtonType.PRIMARY}
      icon={<ConnectIcon className="size-4" />}
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
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data:balances } = useBalances(walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  return walletAddress ? (
    <Popover className="relative">
      <Popover.Button as={CustomPopoverButton} />

      <Popover.Panel className="absolute right-0 z-50 mt-2.5 w-fit rounded-xl border border-grey-800 bg-grey-1000 text-sm shadow-xl">
        <div className="flex gap-2 px-4 py-5 ">
          <WalletIcon className="size-4" />

          <div className="flex gap-2 align-middle text-mid">
            <a
              href={`https://viewblock.io/arweave/address/${walletAddress.toString()}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Tooltip
                message={
                  <div className="text-high">{walletAddress.toString()}</div>
                }
                useMaxWidth={false}
              >
                {formatWalletAddress(walletAddress.toString())}
              </Tooltip>
            </a>
          </div>
          <CopyButton textToCopy={walletAddress.toString()} />
        </div>
        <div className="mx-4  rounded-md border border-grey-800 py-3">
          <div className="px-4 text-xs text-low">{ticker} Balance</div>
          <div className="border-b border-grey-800 px-4 pb-3 pt-1 text-high">
            {balances ? formatBalance(balances.io) : <Placeholder />}
          </div>
          <div className="px-4 pt-3 text-xs text-low">AR Balance</div>
          <div className="px-4 pt-1 text-high">
            {balances ? formatBalance(balances.ar) : <Placeholder />}
          </div>
        </div>
        <div className="flex flex-col gap-3 text-nowrap px-6 py-3 text-mid">
          <button
            className="flex items-center"
            title="Transaction History"
            onClick={async () => {
              window.open(
                `https://ao.link/#/entity/${walletAddress.toString()}`,
                '_blank',
              );
            }}
          >
            <ClockRewindIcon className="mr-2 h-4 w-[.9375rem]" /> Transaction
            History
            <LinkArrowIcon className="ml-1 size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-3 bg-btn-secondary-default px-6 py-3 text-mid">
          <button
            className="flex items-center gap-2"
            title="Logout"
            onClick={async () => {
              await wallet?.disconnect();
              updateWallet(undefined, undefined);
            }}
          >
            <LogoutIcon className="size-4" /> Logout
          </button>
        </div>
      </Popover.Panel>
    </Popover>
  ) : walletStateInitialized ? (
    <div>
      <Button
        buttonType={ButtonType.PRIMARY}
        icon={<ConnectIcon className="size-4" />}
        title="Connect"
        text="Connect"
        onClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && <ConnectModal onClose={() => setIsModalOpen(false)} />}
    </div>
  ) : (
    <div></div>
  );
};
export default Profile;
