import { Gateway, GatewayWithAddress } from '@ar.io/sdk/web';
import { useCallback } from 'react';
import { useGatewaysQuery } from './useGatewaysQuery';

/**
 * Every gateway keyed by address. A view over the shared gateways query — see
 * useGatewaysQuery for why this is not its own fetch.
 */
const useGateways = () => {
  const select = useCallback((gateways: GatewayWithAddress[]) => {
    const byAddress: Record<string, Gateway> = {};

    for (const gateway of gateways) {
      byAddress[gateway.gatewayAddress] = gateway;
    }

    return byAddress;
  }, []);

  return useGatewaysQuery(select);
};

export default useGateways;
