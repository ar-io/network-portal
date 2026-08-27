import type { PortalDocumentName } from './portalApi';

/**
 * Rows read straight from chain after a write, laid over the published
 * snapshot until a snapshot generated *after* that write replaces them.
 *
 * The problem this solves: the canonical queries read static JSON that the
 * analyzer republishes every ~10 minutes, so a write is invisible for up to a
 * publish interval. Invalidating the query does not help — the refetch
 * downloads the same pre-write document. The user who just spent a signature
 * is the one person guaranteed to be looking.
 *
 * Why an overlay of re-read rows rather than a computed delta: applying the
 * transfer arithmetic here would be a second implementation of the protocol's
 * state transition living in the UI, and a wrong one renders a number that
 * never existed on chain — worse than a stale number, which is at least a real
 * past state. Every value here comes from a targeted account read, so the
 * overlay and the next snapshot agree by construction.
 *
 * Why not fall back to the live scan instead: `getBalance` is one account read
 * where `getBalances` is a whole-program scan, so re-reading the two addresses
 * a transfer touched is orders of magnitude cheaper than the fallback.
 *
 * Scope: memory only, so a hard reload before the next publish shows the
 * snapshot again. It self-heals within a publish interval.
 */

interface OverlayEntry {
  /** The replacement row, or null to hide a row the write removed. */
  row: unknown | null;
  /** When the write landed, by the client's clock. Fallback comparison only. */
  writtenAt: number;
  /**
   * The `generatedAt` of the last document seen before this write. Expiry
   * compares publisher timestamp against publisher timestamp, so a client
   * clock that is minutes off does not delete the entry before it is ever
   * applied — which would silently reinstate the bug this exists to fix.
   */
  baseline?: number;
}

const overlays = new Map<PortalDocumentName, Map<string, OverlayEntry>>();

/** The most recent `generatedAt` seen per document, in publisher time. */
const lastSeenGeneratedAt = new Map<PortalDocumentName, number>();

/**
 * Bumped whenever the overlay is discarded — i.e. on a network switch.
 * `clearOverlays` can only drop entries that already exist, but the post-write
 * reads are asynchronous: one started against the old endpoint can land after
 * the switch and record old-network rows into the new network's document.
 * Callers capture this before their reads and hand it back to `recordOverlay`,
 * which drops anything from a superseded generation.
 */
let generation = 0;

export const overlayGeneration = (): number => generation;

/** Called by `portalApi` on every successful document fetch. */
export const noteSnapshotGeneratedAt = (
  name: PortalDocumentName,
  generatedAt: number,
): void => {
  if (Number.isFinite(generatedAt)) {
    lastSeenGeneratedAt.set(name, generatedAt);
  }
};

/** Identifies a row within its document, so an overlay can replace it. */
export const DOCUMENT_ROW_ID: Partial<
  Record<PortalDocumentName, (row: any) => string>
> = {
  balances: (row) => String(row.address),
  vaults: (row) => `${row.address}:${row.vaultId}`,
};

/**
 * Record rows read from chain after a write. `null` hides a row the write
 * removed (a released or revoked vault).
 */
export const recordOverlay = (
  name: PortalDocumentName,
  rows: Array<{ id: string; row: unknown | null }>,
  writtenAt: number = Date.now(),
  expectedGeneration?: number,
): void => {
  // Read against an endpoint we have since switched away from.
  if (expectedGeneration !== undefined && expectedGeneration !== generation) {
    return;
  }

  const forDocument = overlays.get(name) ?? new Map<string, OverlayEntry>();

  const baseline = lastSeenGeneratedAt.get(name);
  for (const { id, row } of rows) {
    forDocument.set(id, { row, writtenAt, baseline });
  }

  overlays.set(name, forDocument);
};

/**
 * Apply pending rows to a freshly fetched document, dropping any the snapshot
 * has caught up with.
 *
 * `generatedAt` is the snapshot's own timestamp; entries older than it are
 * discarded rather than applied, so the overlay disappears on its own without
 * anything needing to clear it.
 */
export const applyOverlay = <T>(
  name: PortalDocumentName,
  items: T[],
  generatedAt: number | undefined,
): T[] => {
  const forDocument = overlays.get(name);
  const identify = DOCUMENT_ROW_ID[name];
  if (!forDocument?.size || !identify) {
    return items;
  }

  // Anything the snapshot now includes is no longer pending. Prefer comparing
  // against the document we had at write time — both sides are then the
  // publisher's clock. Only fall back to the client's `writtenAt` when this
  // document had never been fetched.
  if (generatedAt !== undefined && Number.isFinite(generatedAt)) {
    for (const [id, entry] of forDocument) {
      // Both clocks have to agree that the document post-dates the write.
      //
      // `baseline` alone is not proof: a snapshot generated after the last one
      // we saw can still have been produced before the write confirmed, and
      // expiring on it renders the pre-write document. `writtenAt` alone is not
      // proof either, because it is the client's clock and a machine minutes
      // slow would expire every entry on sight.
      //
      // Requiring both errs toward keeping the overlay, which is the safe
      // direction: it holds values read from chain, so applying it a while
      // longer than strictly necessary still shows the truth.
      const newerThanBaseline =
        entry.baseline === undefined || generatedAt > entry.baseline;
      const newerThanWrite = generatedAt > entry.writtenAt;
      const superseded = newerThanBaseline && newerThanWrite;
      if (superseded) {
        forDocument.delete(id);
      }
    }
  }
  if (!forDocument.size) {
    overlays.delete(name);
    return items;
  }

  const pending = new Map(forDocument);
  const merged: T[] = [];

  for (const item of items) {
    const id = identify(item);
    if (!pending.has(id)) {
      merged.push(item);
      continue;
    }
    const entry = pending.get(id);
    pending.delete(id);
    // A null row means the write removed it.
    if (entry?.row != null) {
      merged.push(entry.row as T);
    }
  }

  // Rows the snapshot has never seen — a first-time recipient, a new vault.
  for (const entry of pending.values()) {
    if (entry.row != null) {
      merged.push(entry.row as T);
    }
  }

  return merged;
};

/** Test seam. */
export const clearOverlays = (): void => {
  overlays.clear();
  lastSeenGeneratedAt.clear();
  generation += 1;
};
