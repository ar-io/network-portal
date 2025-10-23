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
      // Return undefined if any query is still loading
      const isLoading = results.some((result) => result.isLoading);
      if (isLoading || !domains) {
        return undefined;
      }

      // Build the result map
      const data: Record<string, any> = {};
      domains.forEach((domain, index) => {
        data[domain] = results[index].data;
      });
      return data;
    },
  });
};

export default useGatewaysArioInfo;
