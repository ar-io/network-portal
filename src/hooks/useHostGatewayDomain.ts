import { useQuery } from '@tanstack/react-query';

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
        const response = await fetch(`https://${domain}/ar-io/info`);
        const data = await response.json();
        if (data?.wallet) {
          return domain;
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    },
    staleTime: Infinity,
  });

  return queryResults;
};
export default useHostGatewayDomain;
