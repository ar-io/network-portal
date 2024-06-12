import { IO, mIOToken } from '@ar.io/sdk/web';
import { IO_PROCESS_ID } from '@src/constants';
import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import { showErrorToast } from '@src/utils/toast';
import Ar from 'arweave/web/ar';
import { ReactElement, useEffect } from 'react';

const AR = new Ar();

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );

  const wallet = useGlobalState((state) => state.wallet);
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setBalances = useGlobalState((state) => state.setBalances);
  const arweave = useGlobalState((state) => state.arweave);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
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
    if (walletAddress) {
      const updateBalances = async (address: ArweaveTransactionID) => {
        try {
          const [mioBalance, winstonBalance] = await Promise.all([
            arIOReadSDK.getBalance({ address: address.toString() }),
            arweave.wallets.getBalance(address.toString()),
          ]);

          const arBalance = +AR.winstonToAr(winstonBalance);
          const ioBalance = new mIOToken(mioBalance).toIO().valueOf();

          setBalances(arBalance, ioBalance);
        } catch (error) {
          showErrorToast(`${error}`);
        }
      };

      updateBalances(walletAddress);
    }
  }, [walletAddress, blockHeight, arIOReadSDK, arweave, setBalances]);

  useEffect(() => {
    if (wallet) {
      const signer = wallet.signer;

      if (signer) {
        const writeable = IO.init({
          processId: IO_PROCESS_ID.toString(),
          signer,
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
