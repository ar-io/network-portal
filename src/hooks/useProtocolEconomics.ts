import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useSettings } from '@src/store';
import {
  type AnalyzerEconomicsDocument,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import { useQuery } from '@tanstack/react-query';

/**
 * The protocol treasury series: balance, rewards and the ARIO price at each
 * epoch. Rebuilt on the archive's cadence, so an hour of staleness is fine.
 *
 * Returns undefined when the endpoint is unset, is for another network, or does
 * not publish this document — the only consumer is an additive panel.
 */
const useProtocolEconomics = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  const usable =
    availability.networkMatches && availability.documents.includes('economics');

  return useQuery({
    queryKey: ['analyzerEconomics', portalApiUrl, availability.network ?? ''],
    queryFn: () =>
      fetchAnalyzerDocument<AnalyzerEconomicsDocument>('economics'),
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0 && usable,
  });
};

export default useProtocolEconomics;
