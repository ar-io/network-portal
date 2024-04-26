import { useEffectOnce } from '@src/hooks/useEffectOnce';
import { ArConnectWalletConnector } from '@src/services/wallets/ArConnectWalletConnector';
import { useGlobalState } from '@src/store';
import { WALLET_TYPES } from '@src/types';
import { ReactElement, useEffect } from 'react';

const WalletProvider = ({ children }: { children: ReactElement }) => {
  const { setWalletStateInitialized, updateWallet } = useGlobalState();

  useEffect(() => {
    window.addEventListener('arweaveWalletLoaded', updateIfConnected);

    return () => {
      window.removeEventListener('arweaveWalletLoaded', updateIfConnected);
    };
  }, []);

  useEffectOnce(() => {
    setTimeout(() => {
      setWalletStateInitialized(true);
    }, 5000);
  });

  //   useEffect(() => {
  //     if (walletAddress) {
  //       updateBalances(walletAddress);
  //     }
  //   }, [walletAddress, blockHeight]);

  //   const updateBalances = async (address: ArweaveTransactionID) => {
  //     try {
  //       const [ioBalance, arBalance] = await Promise.all([
  //         arweaveDataProvider.getTokenBalance(address, ARNS_REGISTRY_ADDRESS),
  //         arweaveDataProvider.getArBalance(address),
  //       ]);

  //       dispatchWalletState({
  //         type: 'setBalances',
  //         payload: {
  //           [ioTicker]: ioBalance,
  //           ar: arBalance,
  //         },
  //       });
  //     } catch (error) {
  //       eventEmitter.emit('error', error);
  //     }
  //   };

  async function updateIfConnected() {
    const walletType = window.localStorage.getItem('walletType');

    try {
      if (walletType === WALLET_TYPES.ARCONNECT) {
        const connector = new ArConnectWalletConnector();
        const address = await connector?.getWalletAddress();

        updateWallet(address.toString(), connector);
      }
    } catch (error) {
      //   eventEmitter.emit('error', error);
    } finally {
      setWalletStateInitialized(true);
    }
  }

  return <>{children}</>;
};

export default WalletProvider;
