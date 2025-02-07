import { useQuery } from '@tanstack/react-query';

// {"uptime":464459.77230359,"message":"Welcome to the Permaweb.","date":"2024-05-08T08:53:50.015Z"}
export interface HealthCheckResponse {
  uptime: number;
  message: string;
  date: Date;
}

const useHealthcheck = ({
  url 
}: {
  url?: string;
}) => {
  const queryResults = useQuery({
    queryKey: ['healthcheck', url],
    queryFn: async () => {
      if (url === undefined) {
        throw new Error('Error: no URL provided.')
      }

      const healthCheckEndpoint = `${url}/ar-io/healthcheck`;

      const response = await fetch(healthCheckEndpoint); 
      const responseJson = await response.json(); 

      return {
        uptime: responseJson.uptime,
        message: responseJson.message,
        date: new Date(responseJson.date)
      }

    },
    enabled: !!url,
  });

  return queryResults;
};

export default useHealthcheck;
