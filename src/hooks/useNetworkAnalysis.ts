import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useSettings } from '@src/store';
import {
  type AnalyzerNetworkSummary,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import { useQuery } from '@tanstack/react-query';

/**
 * The daily centralization analysis: release-version spread, hosting
 * concentration, and the observer-independence rollup.
 *
 * Rebuilt DAILY, not on the portal's ~10 minute cadence, so `staleTime` is
 * hours rather than minutes — polling it faster only re-fetches an identical
 * document.
 *
 * Returns undefined when the endpoint is unset or the document is unavailable.
 * Every consumer is an additive panel, so absence means "render without it".
 */
const useNetworkAnalysis = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  // Refuse an endpoint that is for another network, or that does not publish
  // this document at all, rather than issuing a request that cannot succeed.
  const usable =
    availability.networkMatches && availability.documents.includes('network');

  return useQuery({
    queryKey: ['analyzerNetwork', portalApiUrl, availability.network ?? ''],
    queryFn: () => fetchAnalyzerDocument<AnalyzerNetworkSummary>('network'),
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0 && usable,
  });
};

export default useNetworkAnalysis;
