import { useEffect, useState } from 'react';
import useGateways from './useGateways';

const useObserverToGatewayMap = () => {
  const { data: gateways } = useGateways();
  const [observerToGatewayMap, setObserverToGatewayMap] =
    useState<Record<string, string>>();

  useEffect(() => {
    if (gateways) {
      const results: Record<string, string> = {};
      Object.entries(gateways).forEach(([gatewayAddress, gateway]) => {
        results[gateway.observerAddress] = gatewayAddress;
      });
      setObserverToGatewayMap(results);
    }
  }, [gateways]);

  return observerToGatewayMap;
};
export default useObserverToGatewayMap;
