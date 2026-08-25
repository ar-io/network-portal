import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useGlobalState, useSettings } from '@src/store';
import {
  type AnalyzerRewardsDocument,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import {
  networkAnnualisedReturn,
  summariseWalletRewards,
} from '@src/utils/walletRewards';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Realized rewards for the connected wallet.
 *
 * The document is ~160KB (~31KB gzipped) and has no per-address query, so it is
 * fetched whole and filtered here. That is the published contract, and settled
 * epochs are byte-stable, so a repeat visit is a 304.
 */
const useWalletRewards = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const availability = useAnalyzerAvailability();
  const usable =
    availability.networkMatches && availability.documents.includes('rewards');

  const query = useQuery({
    queryKey: ['analyzerRewards', portalApiUrl, availability.network ?? ''],
    queryFn: () => fetchAnalyzerDocument<AnalyzerRewardsDocument>('rewards'),
    staleTime: 30 * 60 * 1000,
    // No wallet gate: the network-wide figures are shown on the dashboard,
    // where nobody is connected.
    enabled: portalApiUrl.trim().length > 0 && usable,
  });

  const address = walletAddress?.toString();
  const summary = useMemo(
    () => summariseWalletRewards(query.data ?? undefined, address),
    [query.data, address],
  );
  const network = useMemo(
    () => networkAnnualisedReturn(query.data ?? undefined),
    [query.data],
  );
  const delegateReturn = useMemo(
    () => networkAnnualisedReturn(query.data ?? undefined, 'delegate'),
    [query.data],
  );
  const operatorReturn = useMemo(
    () => networkAnnualisedReturn(query.data ?? undefined, 'operator'),
    [query.data],
  );

  return {
    ...query,
    summary,
    networkReturn: network,
    delegateReturn,
    operatorReturn,
    /** Operator positions only exist once a second stake snapshot is retained. */
    hasOperatorData: (query.data?.counts?.operator ?? 0) > 0,
  };
};

export default useWalletRewards;
