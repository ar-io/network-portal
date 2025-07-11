import { AoGateway, ARIOToken, mARIOToken } from '@ar.io/sdk/web';
import {
  calculateGatewayRewards,
  calculateUserRewards,
  UserRewards,
} from '@src/utils/rewards';
import { useEffect, useState } from 'react';
import useGateways from './useGateways';
import useProtocolBalance from './useProtocolBalance';

const useRewardsInfo = (
  gateway: AoGateway | null | undefined,
  userStake: number,
) => {
  const { data: gateways } = useGateways();
  const { data: protocolBalance } = useProtocolBalance();

  const [userRewards, setUserRewards] = useState<UserRewards>();

  useEffect(() => {
    if (
      gateways &&
      gateway &&
      protocolBalance &&
      protocolBalance > 0 &&
      !isNaN(userStake)
    ) {
      const numGateways = gateways
        ? Object.values(gateways).filter((g) => g.status == 'joined').length
        : 0;
      const gatewayRewards = calculateGatewayRewards(
        new mARIOToken(protocolBalance).toARIO(),
        numGateways,
        gateway,
      );

      const userRewards = calculateUserRewards(
        gatewayRewards,
        new ARIOToken(Math.abs(userStake)),
        userStake < 0,
      );
      setUserRewards(userRewards);
    }
  }, [gateways, gateway, protocolBalance, userStake]);

  return userRewards;
};
export default useRewardsInfo;
