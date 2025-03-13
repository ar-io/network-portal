import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { WanderWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { EthWalletConnector } from '@src/services/wallets/EthWalletConnector';
import { useGlobalState } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import { showErrorToast } from '@src/utils/toast';
import { ReactElement, useCallback, useEffect } from 'react';
import { useAccount, useConfig } from 'wagmi';

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );

  const ethAccount = useAccount();
  const config = useConfig();

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const wallet = useGlobalState((state) => state.wallet);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setContractSigner = useGlobalState((state) => state.setContractSigner);
  const walletType = window.localStorage.getItem(KEY_WALLET_TYPE);

  const updateIfConnected = useCallback(async () => {
    const walletType = window.localStorage.getItem(KEY_WALLET_TYPE);

    try {
      if (walletType === WALLET_TYPES.WANDER) {
        const permissions = await window?.arweaveWallet.getPermissions();

        if (permissions.includes('ACCESS_ADDRESS')) {
          const connector = new WanderWalletConnector();
          const address = await connector?.getWalletAddress();

          updateWallet(address, connector);
        }
      } else if (
        walletType === WALLET_TYPES.ETHEREUM &&
        ethAccount?.isConnected &&
        ethAccount?.address
      ) {
        const connector = new EthWalletConnector(config);

        updateWallet(ethAccount.address, connector);
      }
    } catch (error) {
      showErrorToast(`${error}`);
    } finally {
      setWalletStateInitialized(true);
    }
  }, [
    config,
    ethAccount.address,
    ethAccount?.isConnected,
    setWalletStateInitialized,
    updateWallet,
  ]);

  const handleBeaconDisconnect = () => {
    updateWallet(undefined, undefined);
  };

  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', updateIfConnected);
    window.addEventListener('walletSwitch', updateIfConnected);
    if (walletType === WALLET_TYPES.BEACON) {
      wallet?.on!('disconnected', handleBeaconDisconnect);
    }
    return () => {
      window.removeEventListener('arweaveWalletLoaded', updateIfConnected);
      window.removeEventListener('walletSwitch', updateIfConnected);
      if (walletType === WALLET_TYPES.BEACON) {
        wallet?.off!('disconnected', handleBeaconDisconnect);
      }
    };
  });

  useEffectOnce(() => {
    setTimeout(() => {
      setWalletStateInitialized(true);
    }, 5000);
  });

  useEffect(() => {
    setContractSigner(wallet?.contractSigner);
  }, [setContractSigner, wallet]);

  useEffect(() => {
    if (
      walletAddress &&
      ethAccount.address !== walletAddress &&
      ethAccount.isConnected &&
      wallet instanceof EthWalletConnector
    ) {
      updateIfConnected();
    }
  }, [ethAccount, updateIfConnected, wallet, walletAddress]);

  return <>{children}</>;
};

export default WalletProvider;
