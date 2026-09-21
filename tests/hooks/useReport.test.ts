import { downloadReport } from '@src/hooks/useReport';
import { gzipSync, strFromU8, strToU8 } from 'fflate';
import ky, { type KyResponse } from 'ky';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@src/utils/arweaveUrl', () => ({
  arweaveTxUrl: (id: string) => `https://gateway.example/${id}`,
}));
vi.mock('ky', () => ({ default: { get: vi.fn() } }));

const report = { formatVersion: 2, gatewayAssessments: {} };
const json = strToU8(JSON.stringify(report));

const respondWith = (bytes: Uint8Array, headers = {}) => {
  vi.mocked(ky.get).mockResolvedValue(
    new Response(bytes, { headers }) as KyResponse,
  );
};

afterEach(() => vi.clearAllMocks());

describe('downloadReport', () => {
  it('decodes reports delivered as gzip bytes', async () => {
    respondWith(gzipSync(json));
    expect(JSON.parse(strFromU8(await downloadReport('report')))).toEqual(
      report,
    );
  });

  it('accepts reports already decompressed by the browser', async () => {
    respondWith(json, { 'Content-Encoding': 'gzip' });
    expect(JSON.parse(strFromU8(await downloadReport('report')))).toEqual(
      report,
    );
  });

  it('rejects corrupt gzip data', async () => {
    respondWith(new Uint8Array([0x1f, 0x8b, 0x08]));
    await expect(downloadReport('report')).rejects.toThrow();
  });

  // The Download Report buttons save these bytes straight to disk, so a
  // gateway answering 200 with an error page must not become a .json file.
  it('rejects a payload that is neither gzip nor JSON', async () => {
    respondWith(strToU8('<html>Not found</html>'));
    await expect(downloadReport('report')).rejects.toThrow(
      'neither gzip nor JSON',
    );
  });

  it('rejects an empty body rather than passing it on', async () => {
    respondWith(new Uint8Array());
    await expect(downloadReport('report')).rejects.toThrow(
      'neither gzip nor JSON',
    );
  });

  it('accepts JSON that starts with whitespace', async () => {
    respondWith(strToU8(`\n  ${JSON.stringify(report)}`));
    expect(JSON.parse(strFromU8(await downloadReport('report')))).toEqual(
      report,
    );
  });
});
