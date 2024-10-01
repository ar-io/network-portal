import { AoGateway, IOToken, mIOToken } from '@ar.io/sdk/web';
import {
  UserRewards,
  calculateGatewayRewards,
  calculateUserRewards,
} from '@src/utils/rewards';
import useGateways from './useGateways';
import useProtocolBalance from './useProtocolBalance';

const useRewardsInfo = (gateway: AoGateway | undefined, userStake: number) => {
  const { data: gateways } = useGateways();
  const { data: protocolBalance } = useProtocolBalance();

  let res: UserRewards | undefined = undefined;

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
      new mIOToken(protocolBalance).toIO(),
      numGateways,
      gateway,
    );

    const userRewards = calculateUserRewards(
      gatewayRewards,
      new IOToken(Math.abs(userStake)),
      userStake < 0,
    );
    res = userRewards;
  }

  return res;
};

export default useRewardsInfo;
