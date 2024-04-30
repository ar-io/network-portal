import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '@src/store';
import { WALLET_TYPES } from '@src/types';
import { mioToIo } from '@src/utils';
import { ArweaveTransactionID } from '@src/utils/ArweaveTransactionId';
import Ar from 'arweave/web/ar';
import { ReactElement, useEffect } from 'react';

const AR = new Ar();

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );
  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setBalances = useGlobalState((state) => state.setBalances);
  const arweave = useGlobalState((state) => state.arweave);
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

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
          const ioBalance = mioToIo(mioBalance);

          setBalances(arBalance, ioBalance);
        } catch (error) {
          // eventEmitter.emit('error', error);
        }
      };

      updateBalances(walletAddress);
    }
  }, [walletAddress, blockHeight, arIOReadSDK, arweave, setBalances]);

  const updateIfConnected = async () => {
    const walletType = window.localStorage.getItem('walletType');

    try {
      if (walletType === WALLET_TYPES.ARCONNECT) {
        const connector = new ArConnectWalletConnector();
        const address = await connector?.getWalletAddress();

        updateWallet(address, connector);
      }
    } catch (error) {
      //   eventEmitter.emit('error', error);
    } finally {
      setWalletStateInitialized(true);
    }
  };

  return <>{children}</>;
};

export default WalletProvider;
