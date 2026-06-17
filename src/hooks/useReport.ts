import { arweaveTxUrl } from '@src/utils/arweaveUrl';
import { useQuery } from '@tanstack/react-query';
import { gunzipSync, strFromU8 } from 'fflate';
import ky from 'ky';

export const downloadReport = async (reportId: string) => {
  const reportURL = arweaveTxUrl(reportId);

  const response = await ky.get(reportURL);

  if (!response.ok) {
    throw new Error(`Failed to fetch report: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  const data = gunzipSync(new Uint8Array(arrayBuffer));
  return data;
};

const useReport = (reportId?: string) => {
  const queryResults = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!reportId) {
        throw new Error('reportId not available');
      }

      const data = await downloadReport(reportId);

      return JSON.parse(strFromU8(data));
    },
    enabled: !!reportId,
  });

  return queryResults;
};

export default useReport;
