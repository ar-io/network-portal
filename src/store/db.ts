import { log } from '@src/constants';
import { Assessment } from '@src/types';
import {
  type EpochDataWithCounters,
  fetchEpochLightweight,
} from '@src/utils/epochFetch';
import { getErrorMessage } from '@src/utils/getErrorMessage';
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
};

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
