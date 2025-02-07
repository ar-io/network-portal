import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { EthWalletConnector } from '@src/services/wallets/EthWalletConnector';
import { useGlobalState } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import { showErrorToast } from '@src/utils/toast';
import { ReactElement, useEffect } from 'react';
import { useAccount, useConfig } from 'wagmi';

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );

  const ethAccount = useAccount();
  const config = useConfig();

  const wallet = useGlobalState((state) => state.wallet);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setContractSigner = useGlobalState((state) => state.setContractSigner);

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
    setContractSigner(wallet?.contractSigner);
  }, [setContractSigner, wallet]);

  const updateIfConnected = async () => {
    const walletType = window.localStorage.getItem(KEY_WALLET_TYPE);

    try {
      if (walletType === WALLET_TYPES.ARCONNECT) {
        const connector = new ArConnectWalletConnector();
        const address = await connector?.getWalletAddress();

        updateWallet(address, connector);
      } else if (walletType === WALLET_TYPES.ETHEREUM && ethAccount?.isConnected && ethAccount?.address) {
        const connector = new EthWalletConnector(config);

        updateWallet(ethAccount.address, connector);
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
