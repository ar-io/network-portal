import { log } from '@src/constants';
import { Assessment } from '@src/types';
import {
  type EpochDataWithCounters,
  fetchEpochLightweight,
} from '@src/utils/epochFetch';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import type { NetworkStats } from '@src/utils/networkStats';
import Dexie, { type EntityTable } from 'dexie';

export type NetworkPortalDB = Dexie & {
  observations: EntityTable<
    Observation,
    'id' // primary key "id" (for the typings only)
  >;
  epochs: EntityTable<
    EpochDataWithCounters,
    'epochIndex' // primary key "id" (for the typings only)
  >;
  networkStats: EntityTable<
    CachedNetworkStats,
    'id' // primary key "id" (for the typings only)
  >;
};

/**
 * A single cached row of dashboard counts.
 *
 * One row per database, and the database is already named for the network tier
 * (`solana-mainnet`, `solana-devnet`, …), so the cache is tier-scoped for free.
 * It is deliberately NOT keyed by RPC endpoint: these are facts about the
 * network, not about whichever endpoint was asked, so switching providers
 * within a tier should reuse the cache rather than re-run three program scans.
 */
export interface CachedNetworkStats extends NetworkStats {
  id: string;
  /** When these counts were read, in ms since epoch. */
  fetchedAt: number;
}

/** The only row id used by {@link readCachedNetworkStats}. */
export const NETWORK_STATS_CACHE_KEY = 'current';

export interface Observation {
  id: number;
  timestamp: number;
  gatewayAddress: string;
  assessment: Assessment;
}

const isMissingEpochError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();

  return [
    'not found',
    'not available',
    'does not exist',
    'missing',
    'accountnotfound',
    '404',
  ].some((token) => message.includes(token));
};

export const createDb = (dbName: string = 'solana-mainnet') => {
  const db = new Dexie(dbName) as NetworkPortalDB;
  // Schema declaration:
  db.version(1).stores({
    observations: '++id, timestamp, gatewayAddress', // primary key "id" (for the runtime!)
  });

  db.version(2).stores({
    observations: '++id, timestamp, gatewayAddress', // primary key "id" (for the runtime!)
    epochs: 'epochIndex',
  });

  // v3: epochs cached by v2 predate `observationsSubmitted`, so they would
  // report 0 observations forever. Drop them once; they refetch on demand.
  db.version(3)
    .stores({
      observations: '++id, timestamp, gatewayAddress',
      epochs: 'epochIndex',
    })
    .upgrade((tx) => tx.table('epochs').clear());

  // v4: cache the dashboard's three headline counts. They cost three
  // whole-program scans to compute and change slowly, so a returning visitor
  // should not pay for them again within the TTL.
  db.version(4).stores({
    observations: '++id, timestamp, gatewayAddress',
    epochs: 'epochIndex',
    networkStats: 'id',
  });

  db.open().catch(function (err) {
    console.error('Failed to open db: ', err);
  });

  return db;
};

export const getEpoch = async (
  networkPortalDB: NetworkPortalDB,
  rpc: any,
  garProgram: string,
  epochIndex: number,
) => {
  const epoch = await networkPortalDB.epochs
    .where('epochIndex')
    .equals(epochIndex)
    .first();
  if (epoch) {
    return epoch;
  }

  let epochData: EpochDataWithCounters | undefined;
  try {
    epochData = await fetchEpochLightweight(rpc, garProgram, epochIndex);
  } catch (error) {
    if (isMissingEpochError(error)) {
      log.info(
        `[getEpoch] Epoch ${epochIndex} is not available on this backend yet.`,
      );
      return undefined;
    }

    log.error(
      `[getEpoch] Failed to retrieve epoch ${epochIndex}: ${getErrorMessage(error)}`,
      error,
    );
    throw error;
  }

  if (epochData && epochData.epochIndex !== epochIndex) {
    log.warn(
      `[getEpoch] Epoch index mismatch: requested ${epochIndex}, received ${epochData.epochIndex}.`,
    );
  }

  // Only cache epochs whose counters are final. An epoch that hasn't
  // distributed yet can still take observations, and caching it here would
  // freeze `observationsSubmitted` at whatever it was on first view.
  if (epochData && epochData.rewardsDistributed) {
    try {
      await networkPortalDB.epochs.add(epochData);
    } catch (e) {
      log.error(`Error with epoch data saving for epoch ${epochIndex}:`, e);
      return undefined;
    }
  }

  if (!epochData) {
    log.info(
      `[getEpoch] Empty epoch payload returned for epoch ${epochIndex}.`,
    );
  }

  return epochData;
};

export const cleanupDbCache = async (
  networkPortalDB: NetworkPortalDB,
  currentEpochNumber: number,
) => {
  await networkPortalDB.epochs
    .where('epochIndex')
    .below(currentEpochNumber - 13)
    .delete();
};

/**
 * Read the cached counts if they are still within `ttlMs`.
 *
 * Returns undefined on a miss, on an expired row, or if IndexedDB is
 * unavailable — a private window, a browser with site data blocked, or a failed
 * upgrade. A cache is an optimisation, so every failure here degrades to a
 * fetch rather than an error.
 */
export const readCachedNetworkStats = async (
  networkPortalDB: NetworkPortalDB,
  ttlMs: number,
): Promise<NetworkStats | undefined> => {
  try {
    const cached = await networkPortalDB.networkStats.get(
      NETWORK_STATS_CACHE_KEY,
    );
    if (!cached) return undefined;

    const age = Date.now() - cached.fetchedAt;
    // A negative age means the row was written by a clock ahead of this one;
    // treat it as expired rather than trusting it indefinitely.
    if (age < 0 || age > ttlMs) return undefined;

    return {
      totalAddresses: cached.totalAddresses,
      uniqueDelegates: cached.uniqueDelegates,
      totalVaults: cached.totalVaults,
    };
  } catch (error) {
    log.warn('[db] could not read cached network stats', error);
    return undefined;
  }
};

/** Persist freshly-read counts. Failures are logged, never thrown. */
export const writeCachedNetworkStats = async (
  networkPortalDB: NetworkPortalDB,
  stats: NetworkStats,
): Promise<void> => {
  try {
    await networkPortalDB.networkStats.put({
      ...stats,
      id: NETWORK_STATS_CACHE_KEY,
      fetchedAt: Date.now(),
    });
  } catch (error) {
    log.warn('[db] could not cache network stats', error);
  }
};
