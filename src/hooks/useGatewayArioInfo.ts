import { useQuery } from '@tanstack/react-query';

export interface ArioInfoResponse {
  wallet: string;
  processId: string;
  // ans104UnbundleFilter:...
  // ans104IndexFilter:...
  supportedManifestVersions: string[];
  release:string;
}

const useGatewayArioInfo = ({
  url 
}: {
  url?: string;
}) => {
  const queryResults = useQuery({
    queryKey: ['ario-info', url],
    queryFn: async () => {
      if (url === undefined) {
        throw new Error('Error: no URL provided.')
      }

      const arioInfoEndpoint = `${url}/ar-io/info`;

      const response = await fetch(arioInfoEndpoint); 
      const responseJson = await response.json(); 

      return responseJson as ArioInfoResponse; 

    },
  });

  return queryResults;
};

export default useGatewayArioInfo;
