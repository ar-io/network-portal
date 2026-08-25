import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useSettings } from '@src/store';
import {
  type AnalyzerObserverRollup,
  type AnalyzerObserversDocument,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import { useQuery } from '@tanstack/react-query';

/**
 * Per-observer independence rollup over the retained epoch window: how many
 * epochs each observer covered, how often it cited a report another observer
 * also cited, and the worst severity attached to it.
 *
 * Keyed by observer address for joining against the Observers table.
 */
const useObserverRollup = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  // Refuse an endpoint that is for another network, or that does not publish
  // this document at all, rather than issuing a request that cannot succeed.
  const usable =
    availability.networkMatches && availability.documents.includes('observers');

  return useQuery({
    queryKey: ['analyzerObservers', portalApiUrl, availability.network ?? ''],
    queryFn: async () => {
      const doc =
        await fetchAnalyzerDocument<AnalyzerObserversDocument>('observers');
      if (!doc?.observers) return null;

      const byObserver = new Map<string, AnalyzerObserverRollup>();
      for (const row of doc.observers) {
        if (row?.observer) byObserver.set(row.observer, row);
      }
      return { rows: doc.observers, byObserver };
    },
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0 && usable,
  });
};

export default useObserverRollup;
