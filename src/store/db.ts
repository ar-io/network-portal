import { AoARIORead, AoEpochData } from '@ar.io/sdk/web';
import { log } from '@src/constants';
import { Assessment } from '@src/types';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import Dexie, { type EntityTable } from 'dexie';

export type NetworkPortalDB = Dexie & {
  observations: EntityTable<
    Observation,
    'id' // primary key "id" (for the typings only)
  >;
  epochs: EntityTable<
    AoEpochData,
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

  db.open().catch(function (err) {
    console.error('Failed to open db: ', err);
  });

  return db;
};
export const getEpoch = async (
  networkPortalDB: NetworkPortalDB,
  arIOReadSDK: AoARIORead,
  epochIndex: number,
) => {
  const epoch = await networkPortalDB.epochs
    .where('epochIndex')
    .equals(epochIndex)
    .first();
  if (epoch) {
    return epoch;
  }

  let epochData: AoEpochData | undefined;
  try {
    epochData = await arIOReadSDK.getEpoch({ epochIndex });
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

  if (epochData) {
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
