import type { SolanaRpcSubscriptions, SolanaSigner } from '@ar.io/sdk/solana';
import { ARIO } from '@ar.io/sdk/web';
import { address, createSolanaRpcSubscriptions } from '@solana/kit';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  SOLANA_ARNS_PROGRAM_ID,
  SOLANA_CORE_PROGRAM_ID,
  SOLANA_GAR_PROGRAM_ID,
} from '@src/constants';
import { useGlobalState } from '@src/store';
import { KEY_WALLET_TYPE } from '@src/store/persistent';
import { WALLET_TYPES } from '@src/types';
import {
  type WalletAdapterSigner,
  createWalletAdapterSigner,
  isWalletAdapterReady,
} from '@src/utils/walletAdapterBridge';
import { ReactElement, useEffect } from 'react';

const WalletBridge = ({ children }: { children: ReactElement }) => {
  const { publicKey, signTransaction, connected } = useWallet();

  const updateWallet = useGlobalState((state) => state.updateWallet);
  const setWalletStateInitialized = useGlobalState(
    (state) => state.setWalletStateInitialized,
  );
  const setWriteSDK = useGlobalState((state) => state.setWriteSDK);
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      updateWallet(walletAddress);
      localStorage.setItem(KEY_WALLET_TYPE, WALLET_TYPES.PHANTOM);

      if (signTransaction) {
        try {
          // Create WebSocket URL for subscriptions (required for transaction confirmation)
          const wsUrl = solanaRpcUrl
            .replace(/^http/, 'ws')
            .replace(':8899', ':8900');
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

          if (isWalletAdapterReady(walletAdapter)) {
            const signer = createWalletAdapterSigner(
              walletAdapter,
            ) as unknown as SolanaSigner;

            // Create writeable SDK with proper signer and subscriptions
            const writeSDK = ARIO.init({
              backend: 'solana',
              rpc,
              rpcSubscriptions,
              signer,
              ...(SOLANA_CORE_PROGRAM_ID
                ? { coreProgramId: address(SOLANA_CORE_PROGRAM_ID) }
                : {}),
              ...(SOLANA_GAR_PROGRAM_ID
                ? { garProgramId: address(SOLANA_GAR_PROGRAM_ID) }
                : {}),
              ...(SOLANA_ARNS_PROGRAM_ID
                ? { arnsProgramId: address(SOLANA_ARNS_PROGRAM_ID) }
                : {}),
            });

            console.log(
              '✅ Wallet connected with write capabilities:',
              walletAddress,
            );
            setWriteSDK(writeSDK);
          } else {
            console.warn('Wallet adapter not ready for write operations');
            // Fall back to read-only SDK
            const readOnlySDK = ARIO.init({
              backend: 'solana',
              rpc,
              ...(SOLANA_CORE_PROGRAM_ID
                ? { coreProgramId: address(SOLANA_CORE_PROGRAM_ID) }
                : {}),
              ...(SOLANA_GAR_PROGRAM_ID
                ? { garProgramId: address(SOLANA_GAR_PROGRAM_ID) }
                : {}),
              ...(SOLANA_ARNS_PROGRAM_ID
                ? { arnsProgramId: address(SOLANA_ARNS_PROGRAM_ID) }
                : {}),
            });
            setWriteSDK(readOnlySDK as any);
          }
        } catch (error) {
          console.error('Failed to create wallet signer:', error);
          // Fall back to read-only SDK on error
          const readOnlySDK = ARIO.init({
            backend: 'solana',
            rpc,
            ...(SOLANA_CORE_PROGRAM_ID
              ? { coreProgramId: address(SOLANA_CORE_PROGRAM_ID) }
              : {}),
            ...(SOLANA_GAR_PROGRAM_ID
              ? { garProgramId: address(SOLANA_GAR_PROGRAM_ID) }
              : {}),
            ...(SOLANA_ARNS_PROGRAM_ID
              ? { arnsProgramId: address(SOLANA_ARNS_PROGRAM_ID) }
              : {}),
          });
          setWriteSDK(readOnlySDK as any);
        }
      } else {
        console.log(
          'Wallet connected (read-only - no signing capability):',
          walletAddress,
        );
        // Create read-only SDK if wallet doesn't support signing
        const readOnlySDK = ARIO.init({
          backend: 'solana',
          rpc,
          ...(SOLANA_CORE_PROGRAM_ID
            ? { coreProgramId: address(SOLANA_CORE_PROGRAM_ID) }
            : {}),
          ...(SOLANA_GAR_PROGRAM_ID
            ? { garProgramId: address(SOLANA_GAR_PROGRAM_ID) }
            : {}),
          ...(SOLANA_ARNS_PROGRAM_ID
            ? { arnsProgramId: address(SOLANA_ARNS_PROGRAM_ID) }
            : {}),
        });
        setWriteSDK(readOnlySDK as any);
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
    updateWallet,
    setWalletStateInitialized,
    setWriteSDK,
  ]);

  return <>{children}</>;
};

export default WalletBridge;
