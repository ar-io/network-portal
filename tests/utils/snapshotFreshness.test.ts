// `vi` explicitly: the repo's ambient test globals come from @types/jest,
// which has describe/it/expect but no vitest-specific API.
import { MAX_SNAPSHOT_AGE_MS } from '@src/utils/portalApi';
import {
  LIVE_READ_WINDOW_MS,
  clearDocumentWrites,
  markDocumentWritten,
  shouldReadLive,
} from '@src/utils/snapshotFreshness';
import { vi } from 'vitest';

describe('snapshotFreshness', () => {
  beforeEach(() => {
    clearDocumentWrites();
    vi.useRealTimers();
  });

  afterEach(() => vi.useRealTimers());

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
      expect(LIVE_READ_WINDOW_MS).toBeGreaterThanOrEqual(MAX_SNAPSHOT_AGE_MS);
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

  describe('clearDocumentWrites', () => {
    it('drops every mark, which is what an endpoint change does', () => {
      markDocumentWritten('balances', 'vaults');
      clearDocumentWrites();
      expect(shouldReadLive('balances')).toBe(false);
      expect(shouldReadLive('vaults')).toBe(false);
    });
  });
});
