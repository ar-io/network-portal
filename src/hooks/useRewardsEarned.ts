import { mARIOToken } from '@ar.io/sdk/web';
import { useEffect, useState } from 'react';
import useEpochs from './useEpochs';

export type RewardsEarned = {
  previousEpoch: number;
  totalForPastAvailableEpochs: number;
};

const useRewardsEarned = (walletAddress?: string) => {
  const [rewardsEarned, setRewardsEarned] = useState<RewardsEarned>();
  const { data: epochs } = useEpochs();

  useEffect(() => {
    if (epochs && walletAddress) {
      const sorted = epochs.sort((a, b) => a.epochIndex - b.epochIndex);
      const previousEpoch = sorted[sorted.length - 2];
      const previousEpochDistributed =
        previousEpoch.distributions.rewards.distributed;
      const previousEpochRewards = previousEpochDistributed
        ? previousEpochDistributed[walletAddress] || 0
        : 0;

      const totalForPastAvailableEpochs = epochs.reduce((acc, epoch) => {
        const distributed = epoch.distributions.rewards.distributed;
        return acc + (distributed ? distributed[walletAddress] || 0 : 0);
      }, 0);

      setRewardsEarned({
        previousEpoch: new mARIOToken(previousEpochRewards).toARIO().valueOf(),
        totalForPastAvailableEpochs: new mARIOToken(totalForPastAvailableEpochs)
          .toARIO()
          .valueOf(),
      });
    }
  }, [epochs, walletAddress]);
  return rewardsEarned;
};

export default useRewardsEarned;
