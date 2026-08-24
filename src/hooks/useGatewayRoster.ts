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

  return useQuery({
    queryKey: ['analyzerGatewayRoster', portalApiUrl],
    queryFn: async () => {
      const doc =
        await fetchAnalyzerDocument<AnalyzerGatewaysDocument>('gateways');
      if (!doc?.gateways) return null;

      const byWallet = new Map<string, AnalyzerGatewayRow>();
      const byFqdn = new Map<string, AnalyzerGatewayRow>();
      for (const row of doc.gateways) {
        if (row?.wallet) byWallet.set(row.wallet, row);
        if (row?.fqdn) byFqdn.set(row.fqdn.toLowerCase(), row);
      }
      return { rows: doc.gateways, byWallet, byFqdn };
    },
    staleTime: 60 * 60 * 1000,
    enabled: portalApiUrl.trim().length > 0,
  });
};

export default useGatewayRoster;
