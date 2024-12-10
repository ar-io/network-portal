import {
  AoGateway,
  AoGatewayVault,
  AoGatewayWithAddress,
  AoVaultData,
  mIOToken,
} from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import {
  CancelButtonXIcon,
  InstantWithdrawalIcon,
} from '@src/components/icons';
import CancelWithdrawalModal from '@src/components/modals/CancelWithdrawalModal';
import InstantWithdrawalModal from '@src/components/modals/InstantWithdrawalModal';
import TableView from '@src/components/TableView';
import useGatewayVaults from '@src/hooks/useGatewayVaults';
import { useGlobalState } from '@src/store';
import { formatDateTime, formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

type PendingWithdrawalProps = {
  gateway?: AoGatewayWithAddress;
  walletAddress?: string;
};

const columnHelper = createColumnHelper<AoGatewayVault>();

const PendingWithdrawals = ({
  gateway,
  walletAddress,
}: PendingWithdrawalProps) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { isLoading, data: gatewayVaults } = useGatewayVaults(
    gateway?.gatewayAddress,
  );

  const [confirmCancelWithdrawal, setConfirmCancelWithdrawal] = useState<{
    gatewayAddress: string;
    vaultId: string;
  }>();

  const [confirmInstantWithdrawal, setConfirmInstantWithdrawal] = useState<{
    gatewayAddress: string;
    gateway: AoGateway;
    vault: AoVaultData;
    vaultId: string;
  }>();

  // Define columns for the table
  const columns: ColumnDef<AoGatewayVault, any>[] = [
    columnHelper.accessor('balance', {
      id: 'balance',
      header: 'Stake Withdrawing',
      sortDescFirst: true,
      cell: ({ row }) =>
        `${formatWithCommas(
          new mIOToken(row.original.balance).toIO().valueOf(),
        )} ${ticker}`,
    }),
    columnHelper.accessor('endTimestamp', {
      id: 'endTimestamp',
      header: 'Date of Return',
      sortDescFirst: true,
      cell: ({ row }) => formatDateTime(new Date(row.original.endTimestamp)),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex w-full justify-end gap-2 pr-6">
            <Button
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Expedited Withdrawal"
              text={<InstantWithdrawalIcon className="size-4" />}
              onClick={(e) => {
                e.stopPropagation();
                if (walletAddress && gateway) {
                  setConfirmInstantWithdrawal({
                    gateway: gateway,
                    gatewayAddress: walletAddress?.toString(),
                    vault: row.original,
                    vaultId: row.original.vaultId,
                  });
                }
              }}
            />
            <Button
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Cancel Withdrawal"
              text={<CancelButtonXIcon className="size-4" />}
              onClick={(e) => {
                e.stopPropagation();
                if (gateway) {
                  setConfirmCancelWithdrawal({
                    gatewayAddress: gateway.gatewayAddress,
                    vaultId: row.original.vaultId,
                  });
                }
              }}
            />
          </div>
        );
      },
    }),
  ];

  return walletAddress == gateway?.gatewayAddress && gatewayVaults?.length ? (
    <CollapsiblePanel
      title="Pending Withdrawals"
      titleRight={
        <div className="flex items-center gap-2">
          <div className="text-high">Total Pending:</div>
          <div className="text-gradient-red">
            <div>
              {formatWithCommas(
                new mIOToken(gatewayVaults.reduce((a, b) => a + b.balance, 0))
                  .toIO()
                  .valueOf(),
              )}{' '}
              {ticker}
            </div>
          </div>
        </div>
      }
    >
      {gatewayVaults && gatewayVaults.length > 0 && (
        <TableView
          columns={columns}
          data={gatewayVaults || []}
          defaultSortingState={{ id: 'endTimestamp', desc: false }}
          isLoading={isLoading}
          noDataFoundText="Unable to fetch gateways."
          shortTable={true}
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
    </CollapsiblePanel>
  ) : (
    <></>
  );
};

export default PendingWithdrawals;
