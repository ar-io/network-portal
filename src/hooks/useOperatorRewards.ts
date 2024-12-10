import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import { OperatorRewards, calculateOperatorRewards } from '@src/utils/rewards';
import { useEffect, useState } from 'react';
import useGateways from './useGateways';
import useProtocolBalance from './useProtocolBalance';

const useOperatorRewards = (gateway: AoGateway | undefined) => {
  const { data: gateways } = useGateways();
  const { data: protocolBalance } = useProtocolBalance();

  const [operatorRewards, setOperatorRewards] = useState<OperatorRewards>();

  useEffect(() => {
    if (gateways && gateway && protocolBalance) {
      const numGateways = Object.values(gateways).filter(
        (g) => g.status == 'joined',
      ).length;
      const operatorRewards = calculateOperatorRewards(
        new mIOToken(protocolBalance).toIO(),
        numGateways,
        gateway,
        new mIOToken(gateway.operatorStake).toIO(),
      );
      setOperatorRewards(operatorRewards);
    }
  }, [gateways, gateway, protocolBalance]);

  return operatorRewards;
};

export default useOperatorRewards;
