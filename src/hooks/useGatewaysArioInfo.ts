import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

const useGatewaysArioInfo = ({ domains }: { domains?: string[] }) => {
  const queries = useQueries({
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
      enabled: !!domains,
    })),
  });

  const result = useMemo(() => {
    if (!domains) {
      return undefined;
    }
    const isLoading = queries.some((q) => q.isLoading);
    if (isLoading) {
      return undefined;
    }

    const result: Record<string, any> = {};
    domains?.forEach((domain, index) => {
      result[domain] = queries[index].data;
    });
    return result;
  }, [domains, queries]);

  return result;
};

export default useGatewaysArioInfo;
