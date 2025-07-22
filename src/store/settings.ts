import {
  AO_CU_URL,
  ARIO_PROCESS_ID,
  DEFAULT_ARWEAVE_GQL_ENDPOINT,
} from '@src/constants';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type Settings = {
  aoCuUrl: string;
  arioProcessId: string;
  arweaveGqlUrl: string;
};

export const useSettings = create<Settings>()(
  subscribeWithSelector(
    persist(
      () => ({
        aoCuUrl: AO_CU_URL,
        arioProcessId: ARIO_PROCESS_ID.toString(),
        arweaveGqlUrl: DEFAULT_ARWEAVE_GQL_ENDPOINT,
      }),
      { name: 'settings' },
    ),
  ),
);

export const updateSettings = useSettings.setState;
