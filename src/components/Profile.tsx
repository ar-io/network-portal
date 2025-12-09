/* eslint-disable tailwindcss/migration-from-tailwind-2 */
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import useBalances from '@src/hooks/useBalances';
import useLogo from '@src/hooks/useLogo';
import usePrimaryName from '@src/hooks/usePrimaryName';
import { useGlobalState } from '@src/store';
import {
  formatBalance,
  formatPrimaryName,
  formatWalletAddress,
  getBlockExplorerUrlForAddress,
} from '@src/utils';
import { SendHorizonal, WalletMinimal } from 'lucide-react';
import { ReactElement, forwardRef, useState } from 'react';
import Button, { ButtonType } from './Button';
import CopyButton from './CopyButton';
import Placeholder from './Placeholder';
import Tooltip from './Tooltip';
import {
  ClockRewindIcon,
  ConnectIcon,
  LinkArrowIcon,
  LogoutIcon,
} from './icons';
import ConnectModal from './modals/ConnectModal';
import TransferArioModal from './modals/TransferArioModal';

// eslint-disable-next-line react/display-name
const CustomPopoverButton = forwardRef<
  HTMLButtonElement,
  { children?: ReactElement; logo?: HTMLImageElement }
>((props, ref) => {
  return (
    <Button
      forwardRef={ref}
      buttonType={ButtonType.PRIMARY}
      icon={
        props.logo ? (
          <div className="size-4 overflow-hidden">
            <img src={props.logo.src} alt="Profile" className="size-4" />
          </div>
        ) : (
          <ConnectIcon className="size-4" />
        )
      }
      title="Profile"
      text={props.children}
      {...props}
    />
  );
});

const Profile = () => {
  const walletStateInitialized = useGlobalState(
    (state) => state.walletStateInitialized,
  );
  const wallet = useGlobalState((state) => state.wallet);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const { data: primaryName } = usePrimaryName(walletAddress?.toString());
  const { data: logo } = useLogo({ primaryName: primaryName?.name });

  return walletAddress ? (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton as={CustomPopoverButton} logo={logo}>
            {primaryName
              ? formatPrimaryName(primaryName.name)
              : formatWalletAddress(walletAddress.toString())}
          </PopoverButton>

          <PopoverPanel className="absolute right-0 z-50 mt-2.5 w-fit min-w-52 rounded-xl border border-grey-800 bg-grey-1000 text-sm shadow-xl">
            <div className="flex gap-2 px-4 py-5 ">
              <WalletMinimal className="size-4" />

              <div className="flex gap-2 align-middle text-mid">
                <a
                  href={getBlockExplorerUrlForAddress(walletAddress.toString())}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Tooltip
                    message={
                      <div className="text-high">
                        {walletAddress.toString()}
                      </div>
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
              <div className="relative border-b border-grey-800">
                <div className="px-4 text-xs text-low">{ticker} Balance</div>
                <div className="px-4 pb-3 pt-1 text-high">
                  {balances ? formatBalance(balances.ario) : <Placeholder />}
                </div>
                {balances && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-5 rounded border border-grey-800 p-2"
                    title={`Send ${ticker}`}
                    onClick={() => {
                      setShowTransferModal(true);
                      close();
                    }}
                  >
                    <SendHorizonal className="size-3" />
                  </button>
                )}
              </div>
              <div className="px-4 pt-3 text-xs text-low">AR Balance</div>
              <div className="px-4 pt-1 text-high">
                {balances ? formatBalance(balances.ar) : <Placeholder />}
              </div>
            </div>
            <div className="flex flex-col gap-3 text-nowrap px-6 pt-3 text-mid">
              <button
                className="flex items-center"
                title="Transaction History"
                onClick={async () => {
                  window.open(
                    `https://scan.ar.io/#/wallet/${walletAddress.toString()}`,
                    '_blank',
                  );
                }}
              >
                <ClockRewindIcon className="mr-2 h-4 w-[.9375rem]" />{' '}
                Transaction History
                <LinkArrowIcon className="ml-1 size-3" />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-3 rounded-b-xl bg-btn-secondary-default px-6 py-3 text-mid">
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
          </PopoverPanel>
          {showTransferModal && (
            <TransferArioModal onClose={() => setShowTransferModal(false)} />
          )}
        </>
      )}
    </Popover>
  ) : walletStateInitialized ? (
    <div>
      <Button
        buttonType={ButtonType.PRIMARY}
        icon={<ConnectIcon className="size-4" />}
        title="Connect"
        text="Connect"
        onClick={() => setShowConnectModal(true)}
      />
      {showConnectModal && (
        <ConnectModal onClose={() => setShowConnectModal(false)} />
      )}
    </div>
  ) : (
    <div></div>
  );
};
export default Profile;
