import { useQuery } from '@tanstack/react-query';
import ky from 'ky';

/** Checks where page is served and uses /ar-io/info endpoint to check if it is a gateway.
 *
 * @returns domain name if it is a gateway, otherwise null
 */
const useHostGatewayDomain = () => {
  const queryResults = useQuery({
    queryKey: ['hostGatewayDomain'],
    queryFn: async () => {
      const hostGateway = window.location.hostname;
      const parts = hostGateway.split('.');
      const domain = parts.length > 1 ? parts.slice(1).join('.') : parts[0];

      try {
        const response = await ky.get(`https://${domain}/ar-io/info`, {
          retry: 0,
        });
        const data = (await response.json()) as any;
        if (data?.wallet) {
          return domain;
        } else {
          return null;
        }
      } catch (_error) {
        return null;
      }
    },
    staleTime: Infinity,
  });

  return queryResults;
};
export default useHostGatewayDomain;
