import { useGlobalState, useSettings } from '@src/store';
import {
  type AnalyzerAvailability,
  fetchAnalyzerAvailability,
} from '@src/utils/analyzerApi';
import { networkTierFromRpcUrl } from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

const UNAVAILABLE: AnalyzerAvailability = {
  networkMatches: false,
  documents: [],
  archivedEpochs: [],
};

/**
 * Whether the configured endpoint may be read, and what it publishes.
 *
 * Every analysis hook gates on this, so an endpoint for another network — or
 * one that serves the portal documents but no archive — costs two small reads
 * once rather than a failed request per panel and per epoch.
 */
const useAnalyzerAvailability = (): AnalyzerAvailability => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const { data } = useQuery({
    queryKey: ['analyzerAvailability', portalApiUrl, solanaRpcUrl],
    queryFn: () =>
      fetchAnalyzerAvailability(networkTierFromRpcUrl(solanaRpcUrl)),
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0,
  });

  return data ?? UNAVAILABLE;
};

export default useAnalyzerAvailability;
