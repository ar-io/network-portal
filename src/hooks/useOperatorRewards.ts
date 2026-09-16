import { Gateway, mARIOToken } from '@ar.io/sdk/web';
import { OperatorRewards, calculateOperatorRewards } from '@src/utils/rewards';
import { useEffect, useState } from 'react';
import usePerGatewayReward from './usePerGatewayReward';

const useOperatorRewards = (gateway: Gateway | undefined) => {
  const perGatewayReward = usePerGatewayReward();

  const [operatorRewards, setOperatorRewards] = useState<OperatorRewards>();

  useEffect(() => {
    if (perGatewayReward && gateway) {
      const operatorRewards = calculateOperatorRewards(
        perGatewayReward,
        gateway,
        new mARIOToken(gateway.operatorStake).toARIO(),
      );
      setOperatorRewards(operatorRewards);
    } else {
      // An unknown per-gateway reward means the yield is unknown. Leaving the
      // previous value in place would show a figure from another epoch, or
      // another endpoint, as though it still applied.
      setOperatorRewards(undefined);
    }
  }, [perGatewayReward, gateway]);

  return operatorRewards;
};

export default useOperatorRewards;
