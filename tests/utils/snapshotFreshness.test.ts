// `vi` explicitly: the repo's ambient test globals come from @types/jest,
// which has describe/it/expect but no vitest-specific API.
import { MAX_SNAPSHOT_AGE_MS } from '@src/utils/portalApi';
import {
  LIVE_READ_WINDOW_MS,
  clearDocumentWrites,
  invalidateWrittenDocuments,
  markDocumentWritten,
  shouldReadLive,
} from '@src/utils/snapshotFreshness';
import { vi } from 'vitest';

describe('snapshotFreshness', () => {
  beforeEach(() => {
    clearDocumentWrites();
    vi.useRealTimers();
  });

  afterEach(() => {
    // In the body, a failed assertion would leave a throwing sessionStorage
    // installed and cascade into unrelated tests.
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('reads the snapshot when nothing has been written', () => {
    expect(shouldReadLive('balances')).toBe(false);
    expect(shouldReadLive('vaults')).toBe(false);
  });

  it('reads live after a write to that document', () => {
    markDocumentWritten('balances');
    expect(shouldReadLive('balances')).toBe(true);
  });

  it('only affects the documents the write touched', () => {
    markDocumentWritten('balances');
    expect(shouldReadLive('vaults')).toBe(false);
    expect(shouldReadLive('gateways')).toBe(false);
  });

  it('marks several documents at once', () => {
    markDocumentWritten('balances', 'vaults');
    expect(shouldReadLive('balances')).toBe(true);
    expect(shouldReadLive('vaults')).toBe(true);
  });

  describe('the window', () => {
    it('still reads live just inside it', () => {
      vi.useFakeTimers();
      markDocumentWritten('balances');
      vi.advanceTimersByTime(LIVE_READ_WINDOW_MS - 1000);
      expect(shouldReadLive('balances')).toBe(true);
    });

    it('returns to the snapshot once it closes', () => {
      vi.useFakeTimers();
      markDocumentWritten('balances');
      vi.advanceTimersByTime(LIVE_READ_WINDOW_MS + 1000);
      expect(shouldReadLive('balances')).toBe(false);
    });

    it('outlasts the oldest document the client will still accept', () => {
      // Not merely a publish interval. `fetchPortalDocument` serves anything
      // under MAX_SNAPSHOT_AGE_MS, so if the publisher stalls, the newest
      // document on offer can be nearly that old — and a shorter window would
      // close onto one that predates the write, showing the user their own
      // transfer disappear.
      // Strictly greater, with room for scan-to-publish latency: equality
      // would close the window at the same instant a 30-minute-old, pre-write
      // document becomes acceptable.
      expect(LIVE_READ_WINDOW_MS).toBeGreaterThan(MAX_SNAPSHOT_AGE_MS);
      expect(LIVE_READ_WINDOW_MS - MAX_SNAPSHOT_AGE_MS).toBeGreaterThanOrEqual(
        10 * 60 * 1000,
      );
    });

    it('is measured as a client-side duration, so a skewed clock cancels', () => {
      // Both ends are Date.now() on the same machine. A clock 15 minutes off
      // shifts both equally — which is exactly what comparing against the
      // publisher's `generatedAt` could not do.
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2001-01-01T00:00:00Z'));
      markDocumentWritten('balances');
      vi.advanceTimersByTime(60_000);
      expect(shouldReadLive('balances')).toBe(true);
    });

    it('extends the window when the document is written again', () => {
      vi.useFakeTimers();
      markDocumentWritten('balances');
      vi.advanceTimersByTime(LIVE_READ_WINDOW_MS - 1000);
      markDocumentWritten('balances');
      vi.advanceTimersByTime(LIVE_READ_WINDOW_MS - 1000);
      expect(shouldReadLive('balances')).toBe(true);
    });
  });

  describe('invalidateWrittenDocuments', () => {
    it('marks and invalidates together, which is the whole point', () => {
      // Hand-placing these separately is what left `gateways` invalidated in
      // seven flows and marked in none.
      const invalidateQueries = vi.fn();
      const qc = { invalidateQueries } as unknown as Parameters<
        typeof invalidateWrittenDocuments
      >[0];

      invalidateWrittenDocuments(qc, 'balances', 'gateways');

      expect(shouldReadLive('balances')).toBe(true);
      expect(shouldReadLive('gateways')).toBe(true);
      expect(invalidateQueries).toHaveBeenCalledTimes(2);
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['balances'],
        refetchType: 'active',
      });
    });

    it('never refetches a whole-program scan from a page that is not showing it', () => {
      const invalidateQueries = vi.fn();
      const qc = { invalidateQueries } as unknown as Parameters<
        typeof invalidateWrittenDocuments
      >[0];

      invalidateWrittenDocuments(qc, 'balances', 'vaults', 'gateways');

      for (const call of invalidateQueries.mock.calls) {
        expect(call[0].refetchType).toBe('active');
      }
    });
  });

  describe('sessionStorage persistence', () => {
    // vitest runs in the node environment, where `sessionStorage` is
    // undefined and every access in the module takes its catch path — so
    // without stubbing it, the persistence these tests exist for is never
    // exercised and a regression in the stored shape would ship green.
    const makeStorage = () => {
      const store = new Map<string, string>();
      return {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
        raw: store,
      };
    };

    it('writes the mark out so a reload can read it back', async () => {
      const storage = makeStorage();
      vi.stubGlobal('sessionStorage', storage);

      markDocumentWritten('balances');
      expect(storage.raw.size).toBe(1);

      // A reload is a fresh module instance reading the same storage.
      vi.resetModules();
      const reloaded = await import('@src/utils/snapshotFreshness');
      expect(reloaded.shouldReadLive('balances')).toBe(true);
    });

    it('ignores a corrupted stored value rather than never expiring', async () => {
      // A non-numeric timestamp makes the elapsed check NaN, which `> window`
      // does not catch — the mark would pin live scans for the life of the tab.
      const storage = makeStorage();
      storage.raw.set('portal-document-writes', '{"balances":"not-a-number"}');
      vi.stubGlobal('sessionStorage', storage);

      vi.resetModules();
      const reloaded = await import('@src/utils/snapshotFreshness');
      expect(reloaded.shouldReadLive('balances')).toBe(false);
    });

    it('survives storage being unavailable, as in a private window', () => {
      vi.stubGlobal('sessionStorage', {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      });

      expect(() => markDocumentWritten('vaults')).not.toThrow();
      expect(shouldReadLive('vaults')).toBe(true);
    });
  });

  it('keeps marks separate per network tier', async () => {
    // Scoping is what lets a user glance at another network and come back
    // inside the window without losing the mark. Both modules are imported
    // together so they share one registry — an earlier test resets it.
    vi.resetModules();
    const [fresh, { useSettings }] = await Promise.all([
      import('@src/utils/snapshotFreshness'),
      import('@src/store/settings'),
    ]);
    const original = useSettings.getState().solanaRpcUrl;

    useSettings.setState({ solanaRpcUrl: 'https://api.devnet.solana.com' });
    fresh.markDocumentWritten('balances');
    expect(fresh.shouldReadLive('balances')).toBe(true);

    useSettings.setState({
      solanaRpcUrl: 'https://api.mainnet-beta.solana.com',
    });
    expect(fresh.shouldReadLive('balances')).toBe(false);

    // Back again, and the mark is still there — no clear on the way out.
    useSettings.setState({ solanaRpcUrl: 'https://api.devnet.solana.com' });
    expect(fresh.shouldReadLive('balances')).toBe(true);

    useSettings.setState({ solanaRpcUrl: original });
  });

  describe('clearDocumentWrites', () => {
    it('drops every mark, which is what an endpoint change does', () => {
      markDocumentWritten('balances', 'vaults');
      clearDocumentWrites();
      expect(shouldReadLive('balances')).toBe(false);
      expect(shouldReadLive('vaults')).toBe(false);
    });
  });
});
