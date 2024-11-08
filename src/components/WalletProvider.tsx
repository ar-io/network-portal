import { AOProcess, IO } from '@ar.io/sdk/web';
import { connect } from '@permaweb/aoconnect';
import { AO_CU_URL, IO_PROCESS_ID } from '@src/constants';
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
  const setArIOWriteableSDK = useGlobalState(
    (state) => state.setArIOWriteableSDK,
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

      if (signer) {
        const writeable = IO.init({
          signer,
          process: new AOProcess({
            processId: IO_PROCESS_ID.toString(),
            ao: connect({
              CU_URL: AO_CU_URL,
            }),
          }),
        });
        setArIOWriteableSDK(writeable);
      }
    } else {
      setArIOWriteableSDK(undefined);
    }
  }, [setArIOWriteableSDK, wallet]);

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
