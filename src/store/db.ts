import { AoEpochData, AoIORead } from '@ar.io/sdk';
import { IO_PROCESS_ID } from '@src/constants';
import { Assessment } from '@src/types';
import Dexie, { type EntityTable } from 'dexie';

export interface Observation {
  id: number;
  timestamp: number;
  gatewayAddress: string;
  assessment: Assessment;
}

// Use process ID as the database name so that cached data is unique to each process
const DB_NAME = IO_PROCESS_ID.toString();

export const db = new Dexie(DB_NAME) as Dexie & {
  observations: EntityTable<
    Observation,
    'id' // primary key "id" (for the typings only)
  >;
  epochs: EntityTable<
    AoEpochData,
    'epochIndex' // primary key "id" (for the typings only)
  >;
};

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
export const getEpoch = async (arIOReadSDK: AoIORead, epochIndex: number) => {
  const epoch = await db.epochs.where('epochIndex').equals(epochIndex).first();
  if (epoch) {
    return epoch;
  }

  const epochData = await arIOReadSDK.getEpoch({ epochIndex });

  if (epochData) {
    try {
      await db.epochs.add(epochData);
    } catch (e) {
      console.error('Error with epoch data saving:', epochIndex, e);
      return undefined;
    }
  }
  return epochData;
};

export const cleanupDbCache = async (currentEpochNumber:number) => {
  await db.epochs.where('epochIndex').below(currentEpochNumber - 13).delete();
}

export default db;
