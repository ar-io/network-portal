import { AoARIORead, AoEpochData } from '@ar.io/sdk/web';
import { Assessment } from '@src/types';
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

export const createDb = (dbName: string) => {
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
export const getEpoch = async (networkPortalDB: NetworkPortalDB, arIOReadSDK: AoARIORead, epochIndex: number) => {
  const epoch = await networkPortalDB.epochs.where('epochIndex').equals(epochIndex).first();
  if (epoch) {
    return epoch;
  }

  const epochData = await arIOReadSDK.getEpoch({ epochIndex }).catch((e) => {
    console.error('Error with epoch data fetching:', epochIndex, e);
    return undefined;
  });

  if (epochData) {
    try {
      await networkPortalDB.epochs.add(epochData);
    } catch (e) {
      console.error('Error with epoch data saving:', epochIndex, e);
      return undefined;
    }
  }
  return epochData;
};

export const cleanupDbCache = async (networkPortalDB: NetworkPortalDB, currentEpochNumber: number) => {
  await networkPortalDB.epochs
    .where('epochIndex')
    .below(currentEpochNumber - 13)
    .delete();
};
