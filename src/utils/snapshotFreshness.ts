import type { QueryClient } from '@tanstack/react-query';
import type { PortalDocumentName } from './portalApi';

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
 * the user their own transfer disappear. That invariant is asserted in
 * `tests/utils/snapshotFreshness.test.ts`.
 *
 * Erring long costs scans; erring short reinstates the bug.
 */
export const LIVE_READ_WINDOW_MS = 35 * 60 * 1000;

const STORAGE_KEY = 'portal-document-writes';

/**
 * Backed by `sessionStorage` so a page reload inside the window does not lose
 * the marks — refreshing the tab shortly after a write is ordinary, and the
 * in-memory map alone would serve the pre-write document again. Per tab, and
 * it stores a client timestamp compared only against another client timestamp,
 * so no clock is trusted across machines. Every access is guarded: private
 * modes and blocked site data throw rather than return null.
 */
const load = (): Map<PortalDocumentName, number> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    return new Map(
      Object.entries(JSON.parse(raw)) as Array<[PortalDocumentName, number]>,
    );
  } catch {
    return new Map();
  }
};

const persist = (map: Map<PortalDocumentName, number>): void => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(map)),
    );
  } catch {
    // Memory-only for this session; the window still works until reload.
  }
};

const writtenAt = load();

/**
 * Record that this session changed a document. Synchronous and cheap by
 * design: it sits between a confirmed write and its cache invalidation, so it
 * must not add a round trip there.
 */
export const markDocumentWritten = (...names: PortalDocumentName[]): void => {
  const now = Date.now();
  for (const name of names) {
    writtenAt.set(name, now);
  }
  persist(writtenAt);
};

/** Whether `name` should bypass the snapshot and read from chain. */
export const shouldReadLive = (name: PortalDocumentName): boolean => {
  const at = writtenAt.get(name);
  if (at === undefined) {
    return false;
  }
  if (Date.now() - at > LIVE_READ_WINDOW_MS) {
    writtenAt.delete(name);
    persist(writtenAt);
    return false;
  }
  return true;
};

/**
 * Drop every mark. Called when the endpoint changes: the new network's
 * documents were not written by this session, and reading them live would only
 * spend scans.
 */
export const clearDocumentWrites = (): void => {
  writtenAt.clear();
  persist(writtenAt);
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
 * The query key and the document name are the same string by construction, so
 * they cannot drift apart.
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
