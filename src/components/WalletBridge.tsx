import type { SolanaRpcSubscriptions } from '@ar.io/sdk/solana';
import type { SolanaARIOWriteable } from '@ar.io/sdk/solana';
import { ARIO } from '@ar.io/sdk/web';
import { address, createSolanaRpcSubscriptions } from '@solana/kit';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGlobalState } from '@src/store';
import { useSettings } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import { getOptionalSolanaAddress } from '@src/utils/solanaAddress';
import {
  type WalletAdapterSigner,
  createWalletAdapterSigner,
  isWalletAdapterReady,
} from '@src/utils/walletAdapterBridge';
import { ReactElement, useEffect } from 'react';

const getWalletTypeFromAdapter = (adapterName?: string): string => {
  if (!adapterName) return WALLET_TYPES.PHANTOM;
  const typeMap: Record<string, string> = {
    Phantom: WALLET_TYPES.PHANTOM,
    Solflare: WALLET_TYPES.SOLFLARE,
    Backpack: WALLET_TYPES.BACKPACK,
  };
  return typeMap[adapterName] || WALLET_TYPES.PHANTOM;
};

const WalletBridge = ({ children }: { children: ReactElement }) => {
  const { publicKey, signTransaction, connected, wallet } = useWallet();

  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );
  const setWriteSDK = useGlobalState((state) => state.setWriteSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const solanaCoreProgramId = useSettings((state) => state.solanaCoreProgramId);
  const solanaGarProgramId = useSettings((state) => state.solanaGarProgramId);
  const solanaArnsProgramId = useSettings((state) => state.solanaArnsProgramId);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      updateWallet(walletAddress);
      localStorage.setItem(
        KEY_WALLET_TYPE,
        getWalletTypeFromAdapter(wallet?.adapter?.name),
      );

      if (signTransaction) {
        try {
          // Create WebSocket URL for subscriptions (required for transaction confirmation)
          const wsEndpoint = new URL(solanaRpcUrl);
          wsEndpoint.protocol =
            wsEndpoint.protocol === 'https:' ? 'wss:' : 'ws:';
          if (wsEndpoint.port) {
            wsEndpoint.port = String(Number(wsEndpoint.port) + 1);
          }
          const wsUrl = wsEndpoint.toString();
          const rpcSubscriptions = createSolanaRpcSubscriptions(
            wsUrl,
          ) as SolanaRpcSubscriptions;

          // Create wallet adapter bridge for kit compatibility
          const walletAdapter: WalletAdapterSigner = {
            connected,
            publicKey,
            signTransaction:
              signTransaction as WalletAdapterSigner['signTransaction'],
          };

          console.debug('Wallet adapter signer ready:', {
            connected: walletAdapter.connected,
            hasPublicKey: walletAdapter.publicKey !== null,
            hasSignTransaction:
              typeof walletAdapter.signTransaction === 'function',
          });

          if (isWalletAdapterReady(walletAdapter)) {
            const signer = createWalletAdapterSigner(walletAdapter);
            const coreProgramId = getOptionalSolanaAddress(solanaCoreProgramId);
            const garProgramId = getOptionalSolanaAddress(solanaGarProgramId);
            const arnsProgramId = getOptionalSolanaAddress(solanaArnsProgramId);

            // Create writeable SDK with proper signer and subscriptions
            const writeSDK = ARIO.init({
              rpc,
              rpcSubscriptions,
              signer,
              ...(coreProgramId
                ? { coreProgramId: address(coreProgramId) }
                : {}),
              ...(garProgramId ? { garProgramId: address(garProgramId) } : {}),
              ...(arnsProgramId
                ? { arnsProgramId: address(arnsProgramId) }
                : {}),
            }) as unknown as SolanaARIOWriteable;

            console.log(
              '✅ Wallet connected with write capabilities:',
              walletAddress,
            );
            setWriteSDK(writeSDK);
          } else {
            console.warn('Wallet adapter not ready for write operations');
            setWriteSDK(undefined);
          }
        } catch (error) {
          console.error('Failed to create wallet signer:', error);
          setWriteSDK(undefined);
        }
      } else {
        console.log(
          'Wallet connected (read-only - no signing capability):',
          walletAddress,
        );
        setWriteSDK(undefined);
      }
    } else {
      updateWallet(undefined);
      setWriteSDK(undefined);
      localStorage.removeItem(KEY_WALLET_TYPE);
    }

    setWalletStateInitialized(true);
  }, [
    connected,
    publicKey,
    signTransaction,
    rpc,
    solanaRpcUrl,
    solanaCoreProgramId,
    solanaGarProgramId,
    solanaArnsProgramId,
    updateWallet,
    setWalletStateInitialized,
    setWriteSDK,
    wallet?.adapter?.name,
  ]);

  return <>{children}</>;
};

export default WalletBridge;
