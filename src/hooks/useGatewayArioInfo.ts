import { useQuery } from '@tanstack/react-query';
import ky from 'ky';

export interface ArioInfoResponse {
  wallet: string;
  processId: string;
  // ans104UnbundleFilter:...
  // ans104IndexFilter:...
  supportedManifestVersions: string[];
  release: string;
}

const useGatewayArioInfo = ({ url }: { url?: string }) => {
  const queryResults = useQuery({
    queryKey: ['ario-info', url],
    queryFn: async () => {
      if (url === undefined) {
        throw new Error('Error: no URL provided.');
      }

      const arioInfoEndpoint = `${url}/ar-io/info`;

      const response = await ky.get(arioInfoEndpoint);
      const responseJson = await response.json();

      return responseJson as ArioInfoResponse;
    },
    enabled: !!url,
  });

  return queryResults;
};

export default useGatewayArioInfo;
