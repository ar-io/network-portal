import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import { showErrorToast } from '@src/utils/toast';
import { ReactElement, useEffect } from 'react';

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );

  const wallet = useGlobalState((state) => state.wallet);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setContractSigner = useGlobalState(
    (state) => state.setContractSigner,
  );

  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', updateIfConnected);

    return () => {
      window.removeEventListener('arweaveWalletLoaded', updateIfConnected);
    };
  });

  useEffectOnce(() => {
    setTimeout(() => {
      setWalletStateInitialized(true);
    }, 5000);
  });

  useEffect(() => {
    if (wallet) {
      const signer = wallet.signer;

      setContractSigner(signer);
    } else {
      setContractSigner(undefined);
    }
  }, [setContractSigner, wallet]);

  const updateIfConnected = async () => {
    const walletType = window.localStorage.getItem(KEY_WALLET_TYPE);

    try {
      if (walletType === WALLET_TYPES.ARCONNECT) {
        const connector = new ArConnectWalletConnector();
        const address = await connector?.getWalletAddress();

        updateWallet(address, connector);
      }
    } catch (error) {
      showErrorToast(`${error}`);
    } finally {
      setWalletStateInitialized(true);
    }
  };

  return <>{children}</>;
};

export default WalletProvider;
