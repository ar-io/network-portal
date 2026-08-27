import { useSettings } from '@src/store/settings';
import type { QueryClient } from '@tanstack/react-query';
import type { PortalDocumentName } from './portalApi';
import { networkTierFromRpcUrl } from './portalApi';

/**
 * After a write, read that document live instead of from the published
 * snapshot, for a bounded window.
 *
 * The problem: the canonical queries read JSON the analyzer republishes every
 * ~10 minutes, so a write is invisible for up to a publish interval, and
 * invalidating the query does not help — the refetch downloads the same
 * pre-write document. The user who just spent a signature is the one person
 * guaranteed to be looking.
 *
 * Why a window rather than merging the write into the cached document: the
 * snapshot carries no chain watermark, only a publish timestamp, so there is
 * no sound way to ask "does this document contain my write?". `generatedAt` is
 * when the publisher *wrote* the file, not when it *scanned* the chain, so a
 * document stamped after a write can still predate it. Comparing against the
 * client's clock fails differently, on any machine whose clock is off. Merging
 * needs one of those comparisons to decide when to stop; reading live needs
 * neither, because live data is correct by construction.
 *
 * The one clock this does use is a duration measured entirely on the client —
 * `Date.now()` at both ends — so a skewed clock cancels out.
 *
 * The cost is a whole-program scan instead of a snapshot fetch, bounded to the
 * user who wrote, the documents they touched, and this window. React Query's
 * `staleTime` limits how often that actually runs; browsing is unaffected.
 */

/**
 * Must be at least `MAX_SNAPSHOT_AGE_MS`, not merely a publish interval.
 * `fetchPortalDocument` accepts any document under 30 minutes old, so if the
 * publisher stalls the newest one on offer can be 25 minutes old — and a
 * shorter window would close onto a document that predates the write, showing
 * the user their own transfer disappear. That floor is asserted in
 * `tests/utils/snapshotFreshness.test.ts`.
 *
 * The excess over that floor is a margin, not a proof: `generatedAt` is when
 * the publisher uploaded the file, not when it read the chain, so a document
 * accepted at the moment the window closes could still have been scanned
 * before the write. Fifteen minutes covers the scan-to-publish latency of a
 * run that takes seconds, with room to spare. Erring long costs scans; erring
 * short reinstates the bug.
 */
export const LIVE_READ_WINDOW_MS = 45 * 60 * 1000;

/**
 * Scoped by network tier, the way the IndexedDB name already is. Marks are
 * about one network's published documents, so switching endpoints and back
 * inside the window keeps them rather than needing a clear on the way out —
 * which lost them, reinstating the bug for anyone who looked at another
 * network in between.
 */
const STORAGE_KEY = 'portal-document-writes';

/**
 * Marks are per network tier, the way the IndexedDB name already is: they are
 * about one network's published documents. Scoping them means switching
 * endpoint and back inside the window keeps them, where clearing on the way out
 * lost them and reinstated the bug for anyone who glanced at another network.
 */
const scoped = (name: PortalDocumentName): string => {
  // Guarded: this runs on every snapshot read, and an unset endpoint must not
  // throw from inside a cache decision. An unknown tier simply gets its own
  // bucket, which is correct — those marks belong to no network we can name.
  let tier = 'unknown';
  try {
    const url = useSettings.getState()?.solanaRpcUrl;
    if (url) {
      tier = networkTierFromRpcUrl(url);
    }
  } catch {
    // Store not initialised; keep the fallback bucket.
  }
  return `${tier}:${name}`;
};

/**
 * In memory, mirrored to `sessionStorage`.
 *
 * Memory is the source of truth so a browser that refuses storage — a private
 * window, blocked site data — still gets the window for the rest of the
 * session. The mirror exists only so a reload inside the window does not drop
 * the marks and serve the pre-write document again, which is an ordinary thing
 * for a user to do right after a write.
 */
const writtenAt = new Map<string, number>();

const persist = (): void => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(writtenAt)),
    );
  } catch {
    // Memory-only for this session.
  }
};

try {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    for (const [key, value] of Object.entries(JSON.parse(raw))) {
      if (Number.isFinite(value)) {
        writtenAt.set(key, value as number);
      }
    }
  }
} catch {
  // Nothing to restore.
}

/**
 * Record that this session changed a document. Synchronous and cheap by
 * design: it sits between a confirmed write and its cache invalidation, so it
 * must not add a round trip there.
 */
export const markDocumentWritten = (...names: PortalDocumentName[]): void => {
  const now = Date.now();
  for (const name of names) {
    writtenAt.set(scoped(name), now);
  }
  persist();
};

/** Whether `name` should bypass the snapshot and read from chain. */
export const shouldReadLive = (name: PortalDocumentName): boolean => {
  const at = writtenAt.get(scoped(name));
  if (at === undefined) {
    return false;
  }

  // Guards both ends: a backwards clock jump makes this negative and a
  // corrupted stored value makes it NaN, neither caught by `> window`, which
  // would pin the document into whole-program scans for the life of the tab.
  //
  // No side effect — an expired entry simply reads false. Deleting and
  // re-serialising inside a predicate made two calls either side of the
  // boundary disagree, for no benefit.
  const elapsed = Date.now() - at;
  return (
    Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= LIVE_READ_WINDOW_MS
  );
};

/** Drop every mark. Test seam; the tier scoping makes it unnecessary in app code. */
export const clearDocumentWrites = (): void => {
  writtenAt.clear();
  persist();
};

/**
 * Invalidate a snapshot-backed query and mark its document in one call.
 *
 * The two must always happen together: invalidating without marking refetches
 * the pre-write document, which is the bug this module exists to fix. Leaving
 * that pairing to each call site did not hold — `gateways` was invalidated in
 * seven flows and marked in none of them.
 *
 * `refetchType: 'active'` because these documents are whole-program scans:
 * refetching one from a page where its table is not mounted spends that scan
 * on nothing. Inactive queries are still marked stale and refetch on mount.
 *
 * Only for documents whose query key IS the document name — `balances`,
 * `vaults` and `gateways`. That is not universal: `delegates` is served under
 * `['allDelegates', …]`, so marking it while invalidating `['delegates']`
 * would match no query at all and still buy a 45-minute live-read window. Do
 * not add a name here without checking its hook's key.
 */
export const invalidateWrittenDocuments = (
  queryClient: QueryClient,
  ...names: PortalDocumentName[]
): void => {
  markDocumentWritten(...names);
  for (const name of names) {
    queryClient.invalidateQueries({
      queryKey: [name],
      refetchType: 'active',
    });
  }
};
