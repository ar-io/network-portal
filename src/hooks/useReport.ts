import { DEFAULT_ARWEAVE_HOST, DEFAULT_ARWEAVE_PROTOCOL } from '@src/constants';
import { useQuery } from '@tanstack/react-query';
import { gunzipSync, strFromU8 } from 'fflate';

const useReport = (reportId?: string) => {
  const queryResults = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!reportId) {
        throw new Error('reportId not available');
      }

      const reportURL = `${DEFAULT_ARWEAVE_PROTOCOL}://${DEFAULT_ARWEAVE_HOST}/${reportId}`;

      const response = await fetch(reportURL);

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      const data = gunzipSync(new Uint8Array(arrayBuffer));

      return JSON.parse(strFromU8(data));
    },
  });

  return queryResults;
};

export default useReport;
