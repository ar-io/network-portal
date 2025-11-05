import { isDistributedEpochData, mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useEffect, useState } from 'react';
import useEpochs from './useEpochs';

export type RewardsEarned = {
  previousEpoch: number;
  totalForPastAvailableEpochs: number;
};

const useRewardsEarned = (walletAddress?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const [rewardsEarned, setRewardsEarned] = useState<RewardsEarned>();
  const { data: epochs } = useEpochs();

  useEffect(() => {
    if (arIOReadSDK && epochs && walletAddress) {
      const update = async () => {
        const sorted = epochs.sort(
          (a, b) => (a?.epochIndex || 0) - (b?.epochIndex || 0),
        );
        const previousEpoch = sorted[sorted.length - 2];
        const previousDistribution = previousEpoch?.distributions;

        // rewards are not available on current epoch
        const previousEpochDistributed =
          previousDistribution && isDistributedEpochData(previousDistribution)
            ? (previousDistribution.rewards.distributed ?? {})
            : undefined;

        const previousEpochRewards =
          previousEpochDistributed?.[walletAddress] ?? 0;

        const totalForPastAvailableEpochs = epochs.reduce((acc, epoch) => {
          const distribution = epoch?.distributions;
          const distributed =
            distribution && isDistributedEpochData(distribution)
              ? (distribution.rewards.distributed ?? {})
              : {};
          return acc + (distributed[walletAddress] || 0);
        }, 0);

        setRewardsEarned({
          previousEpoch: new mARIOToken(previousEpochRewards)
            .toARIO()
            .valueOf(),
          totalForPastAvailableEpochs: new mARIOToken(
            totalForPastAvailableEpochs,
          )
            .toARIO()
            .valueOf(),
        });
      };
      update();
    }
  }, [epochs, walletAddress, arIOReadSDK]);
  return rewardsEarned;
};

export default useRewardsEarned;
