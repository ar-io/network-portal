import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useSettings } from '@src/store';
import {
  type AnalyzerFindingsDocument,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import { useQuery } from '@tanstack/react-query';

/**
 * Detector findings across the published epoch window, rather than the single
 * epoch `useObservations` already carries.
 *
 * Rebuilt daily like the rest of the archive, so `staleTime` is an hour;
 * returns undefined when the endpoint is unset, is for another network, or does
 * not publish the archive at all. The only consumer is an additive panel.
 */
const useAnalyzerFindings = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  const usable =
    availability.networkMatches && availability.documents.includes('findings');

  return useQuery({
    queryKey: ['analyzerFindings', portalApiUrl, availability.network ?? ''],
    queryFn: () => fetchAnalyzerDocument<AnalyzerFindingsDocument>('findings'),
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0 && usable,
  });
};

export default useAnalyzerFindings;
