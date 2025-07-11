import {
  ARIO_DEVNET_PROCESS_ID,
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
} from '@ar.io/sdk/web';
import { AO_CU_URL, DEFAULT_ARWEAVE_GQL_ENDPOINT } from '@src/constants';
import { useGlobalState } from '@src/store';
import { useState } from 'react';
import CopyButton from '../CopyButton';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const arioProcessId = useGlobalState((state) => state.arioProcessId);
  const setArioProcessId = useGlobalState((state) => state.setArioProcessId);
  const isDevnet = arioProcessId == ARIO_DEVNET_PROCESS_ID;
  const isTestnet = arioProcessId == ARIO_TESTNET_PROCESS_ID;
  const isMainnet = arioProcessId == ARIO_MAINNET_PROCESS_ID;
  const aoCuUrl = useGlobalState((state) => state.aoCuUrl);
  const setAoCuUrl = useGlobalState((state) => state.setAoCuUrl);
  const arweaveGqlUrl = useGlobalState((state) => state.arweaveGqlUrl);
  const setArweaveGqlUrl = useGlobalState((state) => state.setArweaveGqlUrl);

  const [localCuUrl, setLocalCuUrl] = useState(aoCuUrl);
  const [localGqlUrl, setLocalGqlUrl] = useState(arweaveGqlUrl);

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="h-[32rem] w-[28.4375rem] text-left">
        <div className="flex w-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">Settings</div>

          <div className="my-2 grow overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex items-center">
              <div className="grow">AR.IO Process</div>
              <div className="grid grid-cols-3">
                <button
                  className={`rounded-l border border-grey-500 px-4 py-2 ${isDevnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isDevnet}
                  onClick={() => {
                    setArioProcessId(ARIO_DEVNET_PROCESS_ID);
                  }}
                >
                  Devnet
                </button>
                <button
                  className={`border border-grey-500 px-4 py-2 ${isTestnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isTestnet}
                  onClick={() => {
                    setArioProcessId(ARIO_TESTNET_PROCESS_ID);
                  }}
                >
                  Testnet
                </button>

                <button
                  className={`rounded-r border border-grey-500 px-4 py-2 ${isMainnet ? 'bg-streak-up text-containerL0' : undefined}`}
                  disabled={isMainnet}
                  onClick={() => {
                    setArioProcessId(ARIO_MAINNET_PROCESS_ID);
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
                  setArioProcessId(e.target.value);
                }}
              />
              <CopyButton textToCopy={arioProcessId} />
              <a
                href={`https://www.ao.link/#/entity/${arioProcessId}`}
                target="_blank"
                rel="noreferrer"
              >
                <LinkArrowIcon className="size-4" />
              </a>
            </div>
          </div>

          <div className="my-8 flex grow flex-col gap-2 overflow-y-auto text-sm text-mid scrollbar">
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
                  setAoCuUrl(localCuUrl);
                }}
                disabled={localCuUrl === aoCuUrl}
              >
                Save
              </button>
            </div>
          </div>

          <div className="my-8 flex grow flex-col gap-2 overflow-y-auto text-sm text-mid scrollbar">
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
                  setArweaveGqlUrl(localGqlUrl);
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
