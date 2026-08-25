import useProtocolEconomics from '@src/hooks/useProtocolEconomics';
import { useMemo } from 'react';

/**
 * The ARIO close for each epoch the analyzer has priced.
 *
 * Epochs are priced as the analyzer records them, so the most recent one or two
 * are routinely absent — including the epoch currently in progress. Callers must
 * treat a miss as "not priced yet" rather than as a zero, and must value each
 * epoch at its own close: converting a cumulative ARIO total at today's price is
 * a different number, ~16% apart over the current window.
 */
const useEpochPrices = (): Map<number, number> => {
  const { data } = useProtocolEconomics();

  return useMemo(() => {
    const prices = new Map<number, number>();
    for (const row of data?.series ?? []) {
      if (typeof row.arioPriceUsd === 'number' && row.arioPriceUsd > 0) {
        prices.set(row.epochIndex, row.arioPriceUsd);
      }
    }
    return prices;
  }, [data]);
};

export default useEpochPrices;
