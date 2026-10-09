import { mARIOToken } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import {
  type EmptyRankingReason,
  type SmartDelegateResult,
  explainEmptyRanking,
  rankGateways,
} from '@src/utils/smartDelegate';
import { useMemo } from 'react';
import useAllGateways from './useAllGateways';
import useDelegateStakes from './useDelegateStakes';
import useEpochSettings from './useEpochSettings';
import useGatewayRegistrySettings from './useGatewayRegistrySettings';
import usePerGatewayReward from './usePerGatewayReward';

export type SmartDelegateState = {
  results: SmartDelegateResult[];
  /**
   * `loading` is distinct from an empty `ready`. A spinner promises arrival;
   * an empty result that is still loading would read as "the network has
   * nothing for you", which is a different and wrong claim.
   */
  status: 'loading' | 'ready';
  /** Set only when `status` is `ready` and `results` is empty (SD-1.7). */
  emptyReason?: EmptyRankingReason;
  /**
   * `maxConsecutiveFailures`, for the prune warning in SD-1.4. Undefined when
   * the epoch settings have not loaded or could not be read, in which case the
   * warning is omitted rather than compared against a guessed threshold.
   */
  maxConsecutiveFailures: number | undefined;
  /**
   * Median delegated stake across the ranked candidates, in ARIO, so a result
   * can say where its own stake stands. Undefined where nothing is eligible.
   */
  medianDelegatedStake: number | undefined;
};

/**
 * Rank gateways for a delegation of `amount` ARIO.
 *
 * Adds no query of its own: every input is already fetched by the staking
 * page, and `useAllGateways` is the same cache entry `useRewardsInfo` reads,
 * so the ranked figure and the modal's figure come from one set of data.
 * They can both be up to half an hour stale; agreeing with each other is the
 * property that matters.
 */
/**
 * Median delegated stake, in ARIO, over gateways that hold any.
 *
 * Gateways with none are excluded deliberately: on mainnet more than half of
 * the delegation-open roster holds zero, so including them would put the
 * median at 0 and make every comparison against it meaningless.
 */
const medianDelegatedStakeOf = (
  gateways: { totalDelegatedStake?: number }[],
): number | undefined => {
  const staked = gateways
    .map((g) => new mARIOToken(g.totalDelegatedStake ?? 0).toARIO().valueOf())
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  if (staked.length === 0) return undefined;

  const mid = Math.floor(staked.length / 2);
  return staked.length % 2 === 0
    ? (staked[mid - 1] + staked[mid]) / 2
    : staked[mid];
};

const useSmartDelegate = (amount: number): SmartDelegateState => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: gateways, isLoading: gatewaysLoading } = useAllGateways();
  const perGatewayReward = usePerGatewayReward();
  const { data: registrySettings, isLoading: settingsLoading } =
    useGatewayRegistrySettings();
  const { data: epochSettings } = useEpochSettings();
  const { data: delegateStakes, isLoading: stakesLoading } = useDelegateStakes(
    walletAddress?.toString(),
  );

  /**
   * Gateway address -> this wallet's stake there, in mARIO.
   *
   * Only `stakes` rows. A withdrawal is a position leaving, and the chain
   * reads `delegation.amount`, which a wallet mid-withdrawal can have at zero
   * — counting one would exempt an amount the program still refuses.
   */
  const existingStakeByGateway = useMemo(() => {
    const byGateway: Record<string, number> = {};
    for (const stake of delegateStakes?.stakes ?? []) {
      byGateway[stake.gatewayAddress] =
        (byGateway[stake.gatewayAddress] ?? 0) + stake.balance;
    }
    return byGateway;
  }, [delegateStakes]);

  // A connected wallet's own stakes change which gateways are eligible, so
  // ranking before they arrive would show a list that then changes under the
  // user. Without a wallet there is nothing to wait for.
  const waitingForStakes = walletAddress !== undefined && stakesLoading;
  const loading = gatewaysLoading || settingsLoading || waitingForStakes;

  const protocolMinStake = registrySettings?.delegates?.minStake;
  const wallet = walletAddress?.toString();

  return useMemo(() => {
    if (loading) {
      return {
        results: [],
        status: 'loading',
        maxConsecutiveFailures: undefined,
        medianDelegatedStake: undefined,
      };
    }

    const input = {
      gateways: gateways ?? [],
      amount,
      perGatewayReward,
      walletAddress: wallet,
      protocolMinStake,
      existingStakeByGateway,
    };

    const results = rankGateways(input);

    return {
      results,
      status: 'ready' as const,
      emptyReason:
        results.length === 0 ? explainEmptyRanking(input) : undefined,
      maxConsecutiveFailures: epochSettings?.maxConsecutiveFailures,
      medianDelegatedStake: medianDelegatedStakeOf(input.gateways),
    };
  }, [
    loading,
    gateways,
    amount,
    perGatewayReward,
    wallet,
    protocolMinStake,
    existingStakeByGateway,
    epochSettings?.maxConsecutiveFailures,
  ]);
};

export default useSmartDelegate;
