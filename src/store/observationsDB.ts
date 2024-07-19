import { Assessment } from '@src/types';
import Dexie, { type EntityTable } from 'dexie';

export interface Observation {
  id: number;
  timestamp: number;
  gatewayAddress: string;
  assessment: Assessment;
}

export const observationsDB = new Dexie('ObservationsDatabase') as Dexie & {
  observations: EntityTable<
    Observation,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
observationsDB.version(1).stores({
  observations: '++id, timestamp, gatewayAddress', // primary key "id" (for the runtime!)
});

export default observationsDB;
