import { gzipSync, strFromU8, strToU8 } from 'fflate';
import ky, { type KyResponse } from 'ky';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadReport } from './useReport';

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
});
