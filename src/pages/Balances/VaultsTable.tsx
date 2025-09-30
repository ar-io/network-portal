import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import ColumnSelector from '@src/components/ColumnSelector';
import RevokeVaultModal from '@src/components/modals/RevokeVaultModal';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { formatDate, formatDateTime, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

interface TableData {
  startTimestamp: number;
  endTimestamp: number;

  controller: string;

  daysRemaining: number;
  balance: number;
  vaultId: string;
  vaultAddress: string;
}

const columnHelper = createColumnHelper<TableData>();

const VaultsTable = ({ walletAddress }: { walletAddress?: AoAddress }) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, isError, data: vaults } = useVaults();

  const { walletAddress: userWalletAddress } = useGlobalState();

  const [showRevokeVaultModal, setShowRevokeVaultModal] = useState<
    | {
        recipient: string;
        vaultId: string;
        balance: number;
        endTimestamp: number;
      }
    | undefined
  >();

  const userCanRevoke = useMemo(() => {
    return vaults
      ? vaults.some(
          (vault) => vault.controller === userWalletAddress?.toString(),
        )
      : false;
  }, [userWalletAddress, vaults]);

  const vaultsTableData: Array<TableData> = useMemo(() => {
    return (
      vaults
        ?.filter((vault) => vault.address === walletAddress?.toString())
        .map((vault) => {
          return {
            startTimestamp: vault.startTimestamp,
            endTimestamp: vault.endTimestamp,
            daysRemaining: dayjs(vault.endTimestamp).diff(dayjs(), 'days'),
            balance: new mARIOToken(vault.balance).toARIO().valueOf(),
            controller: vault.controller || 'N/A',
            vaultId: vault.vaultId,
            vaultAddress: vault.address,
          };
        }) ?? []
    );
  }, [vaults, walletAddress]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = useMemo(() => {
    const base = [
      columnHelper.accessor('startTimestamp', {
        id: 'startTimeStamp',
        header: 'Start Date',
        sortDescFirst: false,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>Timestamp: {row.original.startTimestamp}</div>
                <div>
                  Date: {formatDateTime(new Date(row.original.startTimestamp))}
                </div>
              </div>
            }
          >
            <div className="cursor-pointer">
              {formatDate(new Date(row.original.startTimestamp))}
            </div>
          </Tooltip>
        ),
      }),

      columnHelper.accessor('endTimestamp', {
        id: 'endTimestamp',
        header: 'End Date',
        sortDescFirst: false,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>Timestamp: {row.original.endTimestamp}</div>
                <div>
                  Date: {formatDateTime(new Date(row.original.endTimestamp))}
                </div>
              </div>
            }
          >
            <div className="cursor-pointer">
              {formatDate(new Date(row.original.endTimestamp))}
            </div>
          </Tooltip>
        ),
      }),
      columnHelper.accessor('daysRemaining', {
        id: 'daysRemaining',
        header: 'Days Remaining',
        sortDescFirst: false,
      }),
      columnHelper.accessor('controller', {
        id: 'controller',
        header: 'Controller',
        cell: ({ row }) => <AddressCell address={row.getValue('controller')} />,
      }),
      columnHelper.accessor('balance', {
        id: 'balance',
        header: 'Vaulted Tokens',
        cell: ({ row }) => (
          <div className="text-gradient w-fit">
            {formatWithCommas(row.original.balance)} ${ticker}
          </div>
        ),
      }),
    ];

    return userCanRevoke
      ? [
          ...base,
          columnHelper.display({
            id: 'revoke',
            header: '',
            size: 0,
            cell: ({ row }) =>
              row.original.controller === userWalletAddress?.toString() ? (
                <div className="flex justify-end pr-4">
                  <Button
                    buttonType={ButtonType.PRIMARY}
                    active={true}
                    title="Revoke Vault"
                    text="Revoke"
                    className="w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (walletAddress) {
                        setShowRevokeVaultModal({
                          recipient: walletAddress.toString(),
                          vaultId: row.original.vaultId,
                          balance: row.original.balance,
                          endTimestamp: row.original.endTimestamp,
                        });
                      }
                    }}
                  />
                </div>
              ) : null,
          }),
        ]
      : base;
  }, [ticker, userCanRevoke, walletAddress, userWalletAddress]);

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Locked Token Vaults</div>
        <ColumnSelector tableId="vaults" columns={columns} />
      </div>
      <TableView
        columns={columns}
        data={vaultsTableData}
        isLoading={isLoading}
        isError={isError}
        noDataFoundText="No vaults found."
        errorText="Unable to load vaults."
        loadingRows={10}
        defaultSortingState={{ id: 'endTimestamp', desc: false }}
        tableId="vaults"
      />
      {showRevokeVaultModal && (
        <RevokeVaultModal
          recipient={showRevokeVaultModal.recipient}
          vaultId={showRevokeVaultModal.vaultId}
          balance={showRevokeVaultModal.balance}
          endTimestamp={showRevokeVaultModal.endTimestamp}
          onClose={() => setShowRevokeVaultModal(undefined)}
        />
      )}
    </div>
  );
};

export default VaultsTable;
