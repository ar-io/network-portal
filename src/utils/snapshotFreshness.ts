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
 * Long enough to outlast a publish interval (~10 min) plus the scan behind it.
 * Erring long costs scans; erring short shows the user their own write
 * disappearing again, which is the bug this exists to fix.
 */
export const LIVE_READ_WINDOW_MS = 15 * 60 * 1000;

const writtenAt = new Map<PortalDocumentName, number>();

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
};

/** Whether `name` should bypass the snapshot and read from chain. */
export const shouldReadLive = (name: PortalDocumentName): boolean => {
  const at = writtenAt.get(name);
  if (at === undefined) {
    return false;
  }
  if (Date.now() - at > LIVE_READ_WINDOW_MS) {
    writtenAt.delete(name);
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
};
