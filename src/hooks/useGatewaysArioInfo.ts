import { useQueries } from '@tanstack/react-query';

const useGatewaysArioInfo = ({ domains }: { domains?: string[] }) => {
  return useQueries({
    queries: (domains ?? []).map((domain) => ({
      queryKey: ['ario-info', `https://${domain}`],
      queryFn: async () => {
        const response = await fetch(`https://${domain}/ar-io/info`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ario info for ${domain}`);
        }
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
      retry: 1,
      enabled: domains !== undefined,
    })),
    combine: (results) => {
      if (!domains) {
        return undefined;
      }

      // Build the result map with per-gateway state
      // undefined = still loading, null = error/failed, data = successfully loaded
      const data: Record<string, any> = {};
      domains.forEach((domain, index) => {
        const query = results[index];
        if (query.isLoading) {
          data[domain] = undefined;
        } else if (query.isError || !query.data) {
          data[domain] = null;
        } else {
          data[domain] = query.data;
        }
      });
      return data;
    },
  });
};

export default useGatewaysArioInfo;
