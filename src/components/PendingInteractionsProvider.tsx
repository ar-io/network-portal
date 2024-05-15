import { PendingGatewayUpdates, useGlobalState } from '@src/store';
import {
  getPendingDataCache,
  updatePendingDataCache,
} from '@src/store/persistent';
import { ReactElement, useEffect } from 'react';

const PendingInteractionsProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  const arweave = useGlobalState((state) => state.arweave);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const blockHeight = useGlobalState((state) => state.blockHeight);
  const pendingGatewayUpdates = useGlobalState(
    (state) => state.pendingGatewayUpdates,
  );
  const setPendingGatewayUpdates = useGlobalState(
    (state) => state.setPendingGatewayUpdates,
  );

  useEffect(() => {
    if (walletAddress) {
      const pendingDataCache = getPendingDataCache(walletAddress.toString());

      setPendingGatewayUpdates({
        operatorStakeUpdates:
          pendingDataCache.pendingOperatorStakeUpdates || [],
        gatewaySettingsUpdates:
          pendingDataCache.pendingGatewaySettingsUpdates || [],
      });
    } else {
      setPendingGatewayUpdates({
        operatorStakeUpdates: [],
        gatewaySettingsUpdates: [],
      });
    }
  }, [setPendingGatewayUpdates, walletAddress]);


  useEffect(() => {
    const { operatorStakeUpdates, gatewaySettingsUpdates } =
      pendingGatewayUpdates;

    if (
      operatorStakeUpdates.length === 0 &&
      gatewaySettingsUpdates.length === 0
    ) {
      return;
    }

    const checkPendingUpdatesFinalized = async () => {
      const updated: PendingGatewayUpdates = {
        operatorStakeUpdates: [],
        gatewaySettingsUpdates: [],
      };

      let hasChanged = false;

      if (walletAddress) {
        for (const update of operatorStakeUpdates) {
          const txid = update.txid;
          const status = await arweave.transactions.getStatus(txid);

          if (status.confirmed !== null) {
            hasChanged = true;
          } else {
            updated.operatorStakeUpdates.push(update);
          }
        }
        for (const update of gatewaySettingsUpdates) {
          const txid = update.txid;

          const status = await arweave.transactions.getStatus(txid);

          if (status.confirmed !== null) {
            hasChanged = true;
          } else {
            updated.gatewaySettingsUpdates.push(update);
          }
        }

        // since store checks by identity, only update if there were changes to the 
        // pending updates
        if (hasChanged) {
          setPendingGatewayUpdates(updated);
        }

        updatePendingDataCache(walletAddress.toString(), {
          pendingOperatorStakeUpdates: updated.operatorStakeUpdates,
          pendingGatewaySettingsUpdates: updated.gatewaySettingsUpdates,
        });
      }
    };
    checkPendingUpdatesFinalized();
  }, [
    pendingGatewayUpdates,
    blockHeight,
    walletAddress,
    arweave,
    setPendingGatewayUpdates,
  ]);

  return <>{children}</>;
};

export default PendingInteractionsProvider;
