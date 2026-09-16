import { ARIOToken, Gateway } from '@ar.io/sdk/web';
import {
  UserRewards,
  calculateGatewayRewards,
  calculateUserRewards,
} from '@src/utils/rewards';
import { useEffect, useState } from 'react';
import usePerGatewayReward from './usePerGatewayReward';

const useRewardsInfo = (
  gateway: Gateway | null | undefined,
  userStake: number,
) => {
  const perGatewayReward = usePerGatewayReward();

  const [userRewards, setUserRewards] = useState<UserRewards>();

  useEffect(() => {
    if (perGatewayReward && gateway && !isNaN(userStake)) {
      const gatewayRewards = calculateGatewayRewards(perGatewayReward, gateway);

      const userRewards = calculateUserRewards(
        gatewayRewards,
        new ARIOToken(Math.abs(userStake)),
        userStake < 0,
      );
      setUserRewards(userRewards);
    }
  }, [perGatewayReward, gateway, userStake]);

  return userRewards;
};
export default useRewardsInfo;
