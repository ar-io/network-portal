import { Dialog } from '@headlessui/react';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '@src/store';
import { ArweaveWalletConnector } from '@src/types';
import { useState } from 'react';
import Button from '../Button';
import { ArConnectIcon, CloseIcon, ConnectIcon } from '../icons';

const ConnectModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [connecting, setConnecting] = useState<boolean>(false);

  const updateWallet = useGlobalState((state) => state.updateWallet);

  const connect = async (walletConnector: ArweaveWalletConnector) => {
    try {
      setConnecting(true);
      await walletConnector.connect();

      //   const arweaveGate = await walletConnector.getGatewayConfig();
      //   if (arweaveGate?.host) {
      //     await dispatchNewGateway(
      //       arweaveGate.host,
      //       walletConnector,
      //       dispatchGlobalState,
      //     );
      //   }

      const address = await walletConnector.getWalletAddress();

      updateWallet(address, walletConnector);

      onClose();
    } catch (error: any) {
      //   if (walletConnector) {
      //     eventEmitter.emit('error', error);
      //   }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-sm items-stretch rounded-[12px] bg-[#111112] p-[32px] text-center text-grey-100">
          <button className="absolute right-[-28px] top-0" onClick={onClose}>
            <CloseIcon />
          </button>
          <div>
            <div className="flex grow justify-center pb-[16px]">
              <ConnectIcon className="size-[24px]" />
            </div>
            <h2 className="pb-[16px] text-2xl text-high">
              Connect Your Wallet
            </h2>
            <div className="flex grow justify-center pb-[32px]">
              <Button
                onClick={() => {
                  if (!connecting) {
                    connect(new ArConnectWalletConnector());
                  }
                }}
                active={true}
                icon={<ArConnectIcon className="size-[16px]" />}
                title="Connect with ArConnect"
                text="Connect with ArConnect"
              />
            </div>
            <div className="flex grow justify-center gap-[4px] text-sm">
              <div className="text-low">Don&apos;t have a wallet?</div>

              <a
                className="text-mid"
                href="https://ar.io/wallet"
                target="_blank"
                rel="noreferrer"
              >
                Get one here.
              </a>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
