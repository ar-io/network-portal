import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import ColumnSelector from '@src/components/ColumnSelector';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import ReleaseVaultModal from '@src/components/modals/ReleaseVaultModal';
import RevokeVaultModal from '@src/components/modals/RevokeVaultModal';
import useVaults from '@src/hooks/useVaults';
import { useGlobalState } from '@src/store';
import { AoAddress } from '@src/types';
import { formatDate, formatDateTime, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

/**
 * How the vault relates to the address whose page this is: `owned` means the
 * tokens are theirs and land when it unlocks, `sent` means they locked the
 * tokens for someone else and can revoke until then. A vault is never both —
 * the program rejects a locked transfer to yourself (`SelfTransfer`).
 */
type VaultRole = 'owned' | 'sent';

interface TableData {
  startTimestamp: number;
  endTimestamp: number;

  controller: string;

  role: VaultRole;
  daysRemaining: number;
  balance: number;
  vaultId: string;
  vaultAddress: string;
}

const ROLE_BADGE: Record<VaultRole, { label: string; classes: string }> = {
  owned: {
    label: 'Owned',
    classes: 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up',
  },
  sent: { label: 'Sent', classes: 'border-grey-500 bg-grey-700 text-mid' },
};

/**
 * Matches `Bubble`'s pill geometry but not its palette — `Bubble` encodes
 * pass/fail, and these two are categories, not outcomes.
 */
const RoleBadge = ({ role }: { role: VaultRole }) => (
  <div
    className={`flex w-fit items-center rounded-xl border px-2 py-0.5 text-xs ${ROLE_BADGE[role].classes}`}
  >
    {ROLE_BADGE[role].label}
  </div>
);

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

  const [showReleaseVaultModal, setShowReleaseVaultModal] = useState<
    | {
        vaultId: string;
        balance: number;
        endTimestamp: number;
      }
    | undefined
  >();

  // Vaults this address owns AND vaults it controls. Filtering on the owner
  // alone hid every revocable vault from the person who sent it — the only
  // party who can revoke one — so the action existed with no way to reach it.
  const vaultsTableData: Array<TableData> = useMemo(() => {
    const pageAddress = walletAddress?.toString();

    return (
      vaults
        ?.filter(
          (vault) =>
            vault.address === pageAddress || vault.controller === pageAddress,
        )
        .map((vault) => {
          return {
            startTimestamp: vault.startTimestamp,
            endTimestamp: vault.endTimestamp,
            daysRemaining: dayjs(vault.endTimestamp).diff(dayjs(), 'days'),
            balance: new mARIOToken(vault.balance).toARIO().valueOf(),
            controller: vault.controller ?? '',
            role: (vault.address === pageAddress
              ? 'owned'
              : 'sent') as VaultRole,
            vaultId: vault.vaultId,
            vaultAddress: vault.address,
          };
        }) ?? []
    );
  }, [vaults, walletAddress]);

  // Derived from the rows on screen, not from every vault on the network:
  // scanning all of them rendered an empty actions column on pages where
  // nothing shown was actionable.
  const userCanRevoke = useMemo(
    () =>
      vaultsTableData.some(
        (vault) =>
          vault.controller === userWalletAddress?.toString() &&
          vault.endTimestamp > Date.now(),
      ),
    [userWalletAddress, vaultsTableData],
  );

  // Release is owner-signed and only valid after expiry. Show the action when
  // the connected wallet owns an unlocked vault (Solana has no auto-credit at
  // expiry — the owner must call release_vault; see SDK BD-050).
  const userCanRelease = useMemo(
    () =>
      vaultsTableData.some(
        (vault) =>
          vault.vaultAddress === userWalletAddress?.toString() &&
          vault.endTimestamp <= Date.now(),
      ),
    [userWalletAddress, vaultsTableData],
  );

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = useMemo(() => {
    const base = [
      columnHelper.accessor('role', {
        id: 'role',
        header: 'Type',
        cell: ({ row }) => (
          <Tooltip
            message={
              row.original.role === 'owned'
                ? 'Locked for this address. The tokens are released to them when it unlocks.'
                : 'Locked by this address for someone else. Revocable until it unlocks.'
            }
          >
            <div className="cursor-pointer">
              <RoleBadge role={row.original.role} />
            </div>
          </Tooltip>
        ),
      }),
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
        // A vault with no controller is not revocable and has no address to
        // show. Passing the literal 'N/A' through AddressCell rendered it as
        // the address "N/A...N/A", with a button offering to copy it.
        cell: ({ row }) =>
          row.original.controller ? (
            <AddressCell address={row.original.controller} />
          ) : (
            <span className="text-low">&mdash;</span>
          ),
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

    return userCanRevoke || userCanRelease
      ? [
          ...base,
          columnHelper.display({
            id: 'actions',
            header: '',
            size: 0,
            cell: ({ row }) => {
              const isController =
                row.original.controller === userWalletAddress?.toString();
              const isOwner =
                row.original.vaultAddress === userWalletAddress?.toString();
              const isUnlocked = row.original.endTimestamp <= Date.now();
              // Revoke: controller-only, valid only BEFORE expiry.
              const canRevoke = isController && !isUnlocked;
              // Release: owner-only, valid only AFTER expiry.
              const canRelease = isOwner && isUnlocked;

              if (!canRevoke && !canRelease) {
                return null;
              }

              return (
                <div className="flex justify-end gap-2 pr-4">
                  {canRelease && (
                    <Button
                      buttonType={ButtonType.PRIMARY}
                      active={true}
                      title="Release Vault"
                      text="Release"
                      className="w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReleaseVaultModal({
                          vaultId: row.original.vaultId,
                          balance: row.original.balance,
                          endTimestamp: row.original.endTimestamp,
                        });
                      }}
                    />
                  )}
                  {canRevoke && (
                    <Button
                      buttonType={ButtonType.PRIMARY}
                      active={true}
                      title="Revoke Vault"
                      text="Revoke"
                      className="w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        // The vault PDA is derived from its OWNER, which is
                        // not the page address once controlled vaults show up
                        // here.
                        setShowRevokeVaultModal({
                          recipient: row.original.vaultAddress,
                          vaultId: row.original.vaultId,
                          balance: row.original.balance,
                          endTimestamp: row.original.endTimestamp,
                        });
                      }}
                    />
                  )}
                </div>
              );
            },
          }),
        ]
      : base;
  }, [ticker, userCanRevoke, userCanRelease, userWalletAddress]);

  return (
    <div>
      <div className="flex w-full items-center overflow-x-auto rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem]">
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
      {showReleaseVaultModal && (
        <ReleaseVaultModal
          vaultId={showReleaseVaultModal.vaultId}
          balance={showReleaseVaultModal.balance}
          endTimestamp={showReleaseVaultModal.endTimestamp}
          onClose={() => setShowReleaseVaultModal(undefined)}
        />
      )}
    </div>
  );
};

export default VaultsTable;
