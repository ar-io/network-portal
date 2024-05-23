import { useCallback } from 'react';
import { PendingGatewayUpdates, useGlobalState } from '../store';

/** Hook for reading pending updates for gateway settings and operator stake from the global store.
 * Provides functions for adding new updates. Only interacts with global store; PendingInteractionsProvider is 
 * responsible for writes to persistent storage. 
 */
const usePendingGatewayUpdates = () => {
  const pendingGatewayUpdates = useGlobalState(
    (state) => state.pendingGatewayUpdates,
  );
  const setPendingGatewayUpdates = useGlobalState(
    (state) => state.setPendingGatewayUpdates,
  );

  const addPendingGatewayUpdates = useCallback(
    (newPendingGatewayUpdates: PendingGatewayUpdates) => {
      const updated = {
        gatewaySettingsUpdates: [
          ...pendingGatewayUpdates.gatewaySettingsUpdates,
          ...newPendingGatewayUpdates.gatewaySettingsUpdates,
        ],
        operatorStakeUpdates: [
            ...pendingGatewayUpdates.operatorStakeUpdates,
            ...newPendingGatewayUpdates.operatorStakeUpdates,
        ]
      };

      setPendingGatewayUpdates(updated);
    },
    [pendingGatewayUpdates, setPendingGatewayUpdates],
  );

  return {
    pendingGatewayUpdates,
    addPendingGatewayUpdates,
  };
};

export default usePendingGatewayUpdates;
