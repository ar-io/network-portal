import { Gateway, IOToken, mIOToken } from '@ar.io/sdk/web';
import {
  UserRewards,
  calculateGatewayRewards,
  calculateUserRewards,
} from '@src/utils/rewards';
import useGateways from './useGateways';
import useProtocolBalance from './useProtocolBalance';

const useRewardsInfo = (gateway: Gateway | undefined, userStake: number) => {
  const { data: gateways } = useGateways();
  //   const [rewardsInfo, setRewardsInfo] = useState<GatewayRewards>();

  const { data: protocolBalance } = useProtocolBalance();

  let res: UserRewards | undefined = undefined;

  if (
    gateways &&
    gateway &&
    protocolBalance &&
    protocolBalance > 0 &&
    userStake > 0
  ) {
    const numGateways = gateways ? Object.keys(gateways).length : 0;
    const gatewayRewards = calculateGatewayRewards(
      new mIOToken(protocolBalance).toIO(),
      numGateways,
      gateway,
    );
    const userRewards = calculateUserRewards(
      gatewayRewards,
      new IOToken(userStake),
    );
    res = userRewards;
  }

  return res;
};

export default useRewardsInfo;
