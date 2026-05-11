import { DEFAULT_ARWEAVE_GQL_ENDPOINT, SOLANA_RPC_URL } from '@src/constants';
import { updateSettings, useSettings } from '@src/store';
import { useState } from 'react';
import BaseModal from './BaseModal';

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const solanaRpcUrl = useSettings((state) => state.solanaRpcUrl);
  const arweaveGqlUrl = useSettings((state) => state.arweaveGqlUrl);

  const [localRpcUrl, setLocalRpcUrl] = useState(solanaRpcUrl);
  const [localGqlUrl, setLocalGqlUrl] = useState(arweaveGqlUrl);

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="h-[24rem] w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
        <div className="flex w-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">Settings</div>

          <div className="flex grow flex-col gap-2 overflow-y-auto pt-4 text-sm text-mid scrollbar">
            <div className="flex items-center">
              <div className="grow">Solana RPC URL</div>

              <button
                className={`rounded border border-grey-500 bg-streak-up px-4 py-2 text-xs text-containerL0`}
                onClick={() => {
                  setLocalRpcUrl(SOLANA_RPC_URL);
                }}
              >
                Reset to Default
              </button>
            </div>
            <div className="flex items-center">
              <input
                className="w-full rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid focus:outline-none"
                value={localRpcUrl}
                onChange={(e) => {
                  setLocalRpcUrl(e.target.value);
                }}
              />
            </div>
            <div className="flex justify-end">
              <button
                className={`rounded border border-grey-500 px-4 py-2 text-xs text-high disabled:text-low`}
                onClick={() => {
                  updateSettings({ solanaRpcUrl: localRpcUrl });
                }}
                disabled={localRpcUrl === solanaRpcUrl}
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
