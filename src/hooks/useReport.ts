import { arweaveTxUrl } from '@src/utils/arweaveUrl';
import { useQuery } from '@tanstack/react-query';
import { gunzipSync, strFromU8 } from 'fflate';
import ky from 'ky';

const isGzip = (data: Uint8Array) => data[0] === 0x1f && data[1] === 0x8b;

/**
 * A report is JSON, so the first non-whitespace byte is `{` or `[`.
 *
 * Without this check the caller decides what a non-gzip payload means, and the
 * two Download Report buttons don't decide at all: they wrap the bytes in a
 * Blob and save them. A gateway answering 200 with an HTML error page would be
 * written to disk as `report-<txid>.json` instead of raising the error toast.
 */
const looksLikeJson = (data: Uint8Array) => {
  for (const byte of data) {
    // space, tab, LF, CR
    if (byte === 0x20 || byte === 0x09 || byte === 0x0a || byte === 0x0d) {
      continue;
    }
    return byte === 0x7b || byte === 0x5b;
  }
  return false;
};

export const downloadReport = async (reportId: string) => {
  const reportURL = arweaveTxUrl(reportId);

  const response = await ky.get(reportURL);

  if (!response.ok) {
    throw new Error(`Failed to fetch report: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  // Gateways serve these reports two ways, and both reach the browser. With
  // `Content-Encoding: gzip` — what an indexed L1 transaction gets — the
  // browser has already decompressed the body by the time we see it; without
  // the header, the gzip bytes arrive untouched and we decompress them here.
  if (isGzip(data)) {
    return gunzipSync(data);
  }

  if (!looksLikeJson(data)) {
    throw new Error(`Report ${reportId} is neither gzip nor JSON`);
  }

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
