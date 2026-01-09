import { isDistributedEpochData, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import useEpochsWithCount from './useEpochsWithCount';

const useRewardsForAddress = (
  walletAddress?: string,
  epochCount: number = 7,
) => {
  const { data: epochs } = useEpochsWithCount(epochCount);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  return useQuery({
    queryKey: [
      'rewards',
      walletAddress,
      epochCount,
      epochs?.length,
      currentEpoch?.epochIndex,
    ],
    queryFn: async () => {
      if (!epochs || !walletAddress) {
        return { rewardsData: [], totalRewards: 0 };
      }

      // Filter out the current epoch since rewards haven't been distributed yet
      const completedEpochs = epochs.filter(
        (epoch) => epoch?.epochIndex !== currentEpoch?.epochIndex,
      );

      const sortedEpochs = [...completedEpochs].sort(
        (a, b) => (a?.epochIndex || 0) - (b?.epochIndex || 0),
      );

      const rewardsData = sortedEpochs.map((epoch) => {
        const distribution = epoch?.distributions;
        const distributed =
          distribution && isDistributedEpochData(distribution)
            ? (distribution.rewards.distributed ?? {})
            : {};

        const rewardAmount = distributed[walletAddress] || 0;
        const rewardInARIO = new mARIOToken(rewardAmount)
          .toARIO()
          .valueOf()
          .toFixed(1);

        return {
          epochIndex: epoch?.epochIndex || 0,
          rewards: Number(rewardInARIO),
        };
      });

      const totalRewards = rewardsData.reduce(
        (sum, data) => sum + data.rewards,
        0,
      );

      return { rewardsData, totalRewards };
    },
    enabled: !!epochs && !!walletAddress,
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    gcTime: 30 * 60 * 1000, // 30 minutes (historical data doesn't change)
  });
};

export default useRewardsForAddress;
