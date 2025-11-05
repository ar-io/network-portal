import { WanderWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { BeaconWalletConnector } from '@src/services/wallets/BeaconWalletConnector';
import { EthWalletConnector } from '@src/services/wallets/EthWalletConnector';
import { useGlobalState } from '@src/store';
import { NetworkPortalWalletConnector } from '@src/types';
import { useState } from 'react';
import { useConfig } from 'wagmi';
import Button from '../Button';
import { BeaconIcon, ConnectIcon, MetamaskIcon, WanderIcon } from '../icons';
import BaseModal from './BaseModal';

const ConnectModal = ({ onClose }: { onClose: () => void }) => {
  const config = useConfig();

  const [connecting, setConnecting] = useState<boolean>(false);

  const updateWallet = useGlobalState((state) => state.updateWallet);

  const connect = async (walletConnector: NetworkPortalWalletConnector) => {
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
    } catch (_error: any) {
      //   if (walletConnector) {
      //     eventEmitter.emit('error', error);
      //   }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <BaseModal onClose={onClose}>
      <div className="max-w-[calc(100vw)] lg:w-[24.5rem]">
        <div className="flex grow justify-center pb-4">
          <ConnectIcon className="size-6" />
        </div>
        <h2 className="pb-4 text-2xl text-high">Connect Your Wallet</h2>
        <div className="mx-auto flex w-fit grow flex-col items-center justify-center gap-2 pb-8">
          <Button
            onClick={() => {
              if (!connecting) {
                connect(new WanderWalletConnector());
              }
            }}
            active={true}
            icon={<WanderIcon className="size-4" />}
            title="Connect with Wander"
            text="Connect with Wander"
            className="w-full"
          />

          <Button
            onClick={() => {
              if (!connecting) {
                connect(new EthWalletConnector(config));
              }
            }}
            active={true}
            icon={<MetamaskIcon className="size-4" />}
            title="Connect with Metamask"
            text="Connect with Metamask"
          />
          <Button
            onClick={() => {
              if (!connecting) {
                connect(new BeaconWalletConnector());
              }
            }}
            active={true}
            icon={<BeaconIcon className="size-4" />}
            title="Connect with Beacon"
            text="Connect with Beacon"
            className="w-full"
          />
        </div>

        <div className="flex grow justify-center gap-1 text-sm">
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
    </BaseModal>
  );
};

export default ConnectModal;
