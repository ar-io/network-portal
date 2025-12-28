import {
  ARIO_DEVNET_PROCESS_ID,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { AO_CU_URL, DEFAULT_ARWEAVE_GQL_ENDPOINT } from '@src/constants';
import { updateSettings, useSettings } from '@src/store';
import { useState } from 'react';
import CopyButton from '../CopyButton';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const arioProcessId = useSettings((state) => state.arioProcessId);
  const isDevnet = arioProcessId === ARIO_DEVNET_PROCESS_ID;
  const isTestnet = arioProcessId === ARIO_TESTNET_PROCESS_ID;
  const isMainnet = arioProcessId === ARIO_MAINNET_PROCESS_ID;
  const aoCuUrl = useSettings((state) => state.aoCuUrl);
  const arweaveGqlUrl = useSettings((state) => state.arweaveGqlUrl);

  const [localCuUrl, setLocalCuUrl] = useState(aoCuUrl);
  const [localGqlUrl, setLocalGqlUrl] = useState(arweaveGqlUrl);

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="h-[32rem] w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
        <div className="flex w-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">Settings</div>

          <div className="my-2 grow overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex flex-col items-center gap-2 lg:flex-row">
              <div className="grow">AR.IO Process</div>
              <div className="grid grid-cols-3">
                <button
                  className={`rounded-l border border-grey-500 px-4 py-2 ${isDevnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isDevnet}
                  onClick={() => {
                    updateSettings({ arioProcessId: ARIO_DEVNET_PROCESS_ID });
                  }}
                >
                  Devnet
                </button>
                <button
                  className={`border border-grey-500 px-4 py-2 ${isTestnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isTestnet}
                  onClick={() => {
                    updateSettings({ arioProcessId: ARIO_TESTNET_PROCESS_ID });
                  }}
                >
                  Testnet
                </button>

                <button
                  className={`rounded-r border border-grey-500 px-4 py-2 ${isMainnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isMainnet}
                  onClick={() => {
                    updateSettings({ arioProcessId: ARIO_MAINNET_PROCESS_ID });
                  }}
                >
                  Mainnet
                </button>
              </div>
            </div>
            <div className="my-4 flex items-center justify-center gap-2 text-center text-sm text-mid">
              <input
                type="text"
                value={arioProcessId}
                className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                onChange={(e) => {
                  if (e.target.value.length !== 43) return;
                  updateSettings({ arioProcessId: e.target.value });
                }}
              />
              <CopyButton textToCopy={arioProcessId} />
              <a
                href={`https://scan.ar.io/#/entity/${arioProcessId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LinkArrowIcon className="size-4" />
              </a>
            </div>
          </div>

          <div className="flex grow flex-col gap-2 overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex items-center">
              <div className="grow">AO CU URL</div>

              <button
                className={`rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0`}
                onClick={() => {
                  setLocalCuUrl(AO_CU_URL);
                }}
              >
                Reset to Default
              </button>
            </div>
            <div className="flex items-center">
              <input
                className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                value={localCuUrl}
                onChange={(e) => {
                  setLocalCuUrl(e.target.value);
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                className={`rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low`}
                onClick={() => {
                  updateSettings({ aoCuUrl: localCuUrl });
                }}
                disabled={localCuUrl === aoCuUrl}
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex grow flex-col gap-2 overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex items-center">
              <div className="grow">Arweave GQL URL</div>

              <button
                className={`rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0`}
                onClick={() => {
                  setLocalGqlUrl(DEFAULT_ARWEAVE_GQL_ENDPOINT);
                }}
              >
                Reset to Default
              </button>
            </div>
            <div className="flex items-center">
              <input
                className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                value={localGqlUrl}
                onChange={(e) => {
                  setLocalGqlUrl(e.target.value);
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                className={`rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low`}
                onClick={() => {
                  updateSettings({ arweaveGqlUrl: localGqlUrl });
                }}
                disabled={localGqlUrl === arweaveGqlUrl}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SettingsModal;
