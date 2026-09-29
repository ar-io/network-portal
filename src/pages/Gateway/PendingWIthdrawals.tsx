import {
  Gateway,
  GatewayVault,
  GatewayWithAddress,
  VaultData,
  mARIOToken,
} from '@ar.io/sdk/web';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import TableView from '@src/components/TableView';
import { ThreeDotsIcon } from '@src/components/icons';
import CancelWithdrawalModal from '@src/components/modals/CancelWithdrawalModal';
import ClaimWithdrawalModal from '@src/components/modals/ClaimWithdrawalModal';
import InstantWithdrawalModal from '@src/components/modals/InstantWithdrawalModal';
import RedelegateModal, {
  RedelegateModalProps,
} from '@src/components/modals/RedelegateModal';
import useGatewayVaults from '@src/hooks/useGatewayVaults';
import { nextFutureTimestamp, useTickAt } from '@src/hooks/useTickAt';
import { useGlobalState } from '@src/store';
import { formatDateTime, formatWithCommas } from '@src/utils';
import { canStillExpedite, isWithdrawalUnlocked } from '@src/utils/stake';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

type PendingWithdrawalProps = {
  gateway?: GatewayWithAddress | null;
  walletAddress?: string;
};

const columnHelper = createColumnHelper<GatewayVault>();

const PendingWithdrawals = ({
  gateway,
  walletAddress,
}: PendingWithdrawalProps) => {
  const ticker = useGlobalState((state) => state.ticker);
  const {
    isLoading,
    isError,
    data: gatewayVaults,
  } = useGatewayVaults(gateway?.gatewayAddress);

  const [confirmClaimWithdrawal, setConfirmClaimWithdrawal] = useState<{
    withdrawalId: string;
    balance: number;
    endTimestamp: number;
  }>();

  const [confirmCancelWithdrawal, setConfirmCancelWithdrawal] = useState<{
    gatewayAddress: string;
    vaultId: string;
  }>();

  const [confirmInstantWithdrawal, setConfirmInstantWithdrawal] = useState<{
    gatewayAddress: string;
    gateway: Gateway;
    vault: VaultData;
    vaultId: string;
  }>();

  const [showRedelegateModal, setShowRedelegateModal] =
    useState<RedelegateModalProps>();

  // See MyStakesTable: maturity is a clock event, not a refetch.
  useTickAt(
    nextFutureTimestamp((gatewayVaults ?? []).map((v) => v.endTimestamp)),
  );

  // Define columns for the table
  const columns: ColumnDef<GatewayVault, any>[] = [
    columnHelper.accessor('balance', {
      id: 'balance',
      header: 'Stake Withdrawing',
      sortDescFirst: true,
      cell: ({ row }) =>
        `${formatWithCommas(
          new mARIOToken(row.original.balance).toARIO().valueOf(),
        )} ${ticker}`,
    }),
    columnHelper.accessor('endTimestamp', {
      id: 'endTimestamp',
      header: 'Date of Return',
      sortDescFirst: true,
      cell: ({ row }) => (
        <div>
          {formatDateTime(new Date(row.original.endTimestamp))}
          {isWithdrawalUnlocked(row.original.endTimestamp) && (
            <span className="ml-2 text-green-600">Unlocked</span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex w-full justify-end pr-6">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                asChild
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="cursor-pointer rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end  p-px">
                  <div className="inline-flex size-full items-center justify-start gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.3125rem] py-[.3125rem] shadow-inner">
                    <ThreeDotsIcon className="size-4" />
                  </div>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50 rounded border border-grey-500 bg-containerL0 text-sm">
                {isWithdrawalUnlocked(row.original.endTimestamp) && (
                  // Matured: claiming returns the full amount, so this leads.
                  // Expediting the same tokens costs 10%.
                  <DropdownMenu.Item
                    className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmClaimWithdrawal({
                        withdrawalId: row.original.vaultId,
                        balance: row.original.balance,
                        endTimestamp: row.original.endTimestamp,
                      });
                    }}
                  >
                    Claim Withdrawal
                  </DropdownMenu.Item>
                )}

                {canStillExpedite(row.original.endTimestamp) && (
                  <DropdownMenu.Item
                    className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gateway) {
                        setConfirmInstantWithdrawal({
                          gateway: gateway,
                          gatewayAddress: gateway.gatewayAddress,
                          vault: row.original,
                          vaultId: row.original.vaultId,
                        });
                      }
                    }}
                  >
                    Expedite Withdrawal
                  </DropdownMenu.Item>
                )}

                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (gateway) {
                      setConfirmCancelWithdrawal({
                        gatewayAddress: gateway.gatewayAddress,
                        vaultId: row.original.vaultId,
                      });
                    }
                  }}
                >
                  Cancel Withdrawal
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none  px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (gateway) {
                      setShowRedelegateModal({
                        sourceGateway: gateway,
                        onClose: () => setShowRedelegateModal(undefined),
                        maxRedelegationStake: new mARIOToken(
                          row.original.balance,
                        ).toARIO(),
                        vaultId: row.original.vaultId,
                      });
                    }
                  }}
                >
                  Redelegate
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        );
      },
    }),
  ];

  // The panel disappears once the last withdrawal is gone, so the modals live
  // outside it. Claiming the final one empties this list, and a modal mounted
  // inside used to unmount mid-flow — taking its success message and
  // transaction id with it, at the one moment the user needs to read them.
  const isOwner = walletAddress === gateway?.gatewayAddress;
  const showPanel =
    isOwner && ((gatewayVaults && gatewayVaults.length > 0) || isLoading);

  if (!isOwner) {
    return <></>;
  }

  return (
    <>
      {showPanel && (
        <CollapsiblePanel
          title="Pending Withdrawals"
          titleRight={
            <div className="flex items-center gap-2">
              <div className="text-high">Total Pending:</div>
              <div className="text-gradient-red">
                <div>
                  {formatWithCommas(
                    new mARIOToken(
                      gatewayVaults?.reduce((a, b) => a + b.balance, 0) || 0,
                    )
                      .toARIO()
                      .valueOf(),
                  )}{' '}
                  {ticker}
                </div>
              </div>
            </div>
          }
        >
          {(isLoading || (gatewayVaults && gatewayVaults.length > 0)) && (
            <TableView
              columns={columns}
              data={gatewayVaults || []}
              defaultSortingState={{ id: 'endTimestamp', desc: false }}
              isLoading={isLoading}
              isError={isError}
              noDataFoundText="No pending withdrawals found."
              errorText="Unable to load pending withdrawals."
              loadingRows={10}
              shortTable={true}
            />
          )}
        </CollapsiblePanel>
      )}

      {confirmClaimWithdrawal && (
        <ClaimWithdrawalModal
          withdrawalId={confirmClaimWithdrawal.withdrawalId}
          balance={confirmClaimWithdrawal.balance}
          endTimestamp={confirmClaimWithdrawal.endTimestamp}
          onClose={() => setConfirmClaimWithdrawal(undefined)}
        />
      )}
      {confirmCancelWithdrawal && (
        <CancelWithdrawalModal
          gatewayAddress={confirmCancelWithdrawal.gatewayAddress}
          vaultId={confirmCancelWithdrawal.vaultId}
          onClose={() => setConfirmCancelWithdrawal(undefined)}
        />
      )}
      {confirmInstantWithdrawal && (
        <InstantWithdrawalModal
          gateway={confirmInstantWithdrawal.gateway}
          gatewayAddress={confirmInstantWithdrawal.gatewayAddress}
          vaultId={confirmInstantWithdrawal.vaultId}
          vault={confirmInstantWithdrawal.vault}
          onClose={() => setConfirmInstantWithdrawal(undefined)}
        />
      )}
      {showRedelegateModal && <RedelegateModal {...showRedelegateModal} />}
    </>
  );
};

export default PendingWithdrawals;
