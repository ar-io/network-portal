import useAnalyzerAvailability from '@src/hooks/useAnalyzerAvailability';
import { useSettings } from '@src/store';
import {
  type AnalyzerGatewayRow,
  type AnalyzerGatewaysDocument,
  fetchAnalyzerDocument,
} from '@src/utils/analyzerApi';
import { useQuery } from '@tanstack/react-query';

/**
 * Per-gateway analysis roster — resolved infrastructure (ASN, ISP, country,
 * hosting), release version, and cluster membership.
 *
 * Covers only gateways that are joined AND publish an FQDN, because the
 * analysis resolves DNS for each one — roughly half the registry. A gateway
 * missing from here is normal, not an error, so lookups return undefined
 * rather than throwing.
 */
const useGatewayRoster = () => {
  const portalApiUrl = useSettings((state) => state.portalApiUrl);
  const availability = useAnalyzerAvailability();
  // Refuse an endpoint that is for another network, or that does not publish
  // this document at all, rather than issuing a request that cannot succeed.
  const usable =
    availability.networkMatches && availability.documents.includes('gateways');

  return useQuery({
    queryKey: [
      'analyzerGatewayRoster',
      portalApiUrl,
      availability.network ?? '',
    ],
    queryFn: async () => {
      const doc =
        await fetchAnalyzerDocument<AnalyzerGatewaysDocument>('gateways');
      if (!doc?.gateways) return null;

      const byWallet = new Map<string, AnalyzerGatewayRow>();
      const byFqdn = new Map<string, AnalyzerGatewayRow>();
      const ambiguousFqdns = new Set<string>();

      for (const row of doc.gateways) {
        if (row?.wallet) byWallet.set(row.wallet, row);
        if (!row?.fqdn) continue;

        const fqdn = row.fqdn.toLowerCase();
        // Overwriting would leave whichever row happened to be last, and the
        // FQDN fallback would then hand out another gateway's infrastructure.
        if (byFqdn.has(fqdn)) ambiguousFqdns.add(fqdn);
        else byFqdn.set(fqdn, row);
      }

      return { rows: doc.gateways, byWallet, byFqdn, ambiguousFqdns };
    },
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0 && usable,
  });
};

export default useGatewayRoster;
