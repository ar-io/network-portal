import { AoGateway, AoVaultData, mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import Dropdown from '@src/components/Dropdown';
import Streak from '@src/components/Streak';
import TableView from '@src/components/TableView';
import {
  CancelButtonXIcon,
  GearIcon,
  InstantWithdrawalIcon,
} from '@src/components/icons';
import CancelWithdrawalModal from '@src/components/modals/CancelWithdrawalModal';
import InstantWithdrawalModal from '@src/components/modals/InstantWithdrawalModal';
import StakingModal from '@src/components/modals/StakingModal';
import WithdrawAllModal from '@src/components/modals/WithdrawAllModal';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ActiveStakesTableData {
  owner: string;
  delegatedStake: number;
  gateway: AoGateway;
  pendingWithdrawals: number;
  streak: number;
}

interface PendingWithdrawalsTableData {
  owner: string;
  gateway: AoGateway;
  withdrawal: AoVaultData;
  withdrawalId: string;
}

type TableMode = 'activeStakes' | 'pendingWithdrawals';

const columnHelper = createColumnHelper<ActiveStakesTableData>();
const columnHelperWithdrawals =
  createColumnHelper<PendingWithdrawalsTableData>();

const MyStakesTable = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const { isFetching, data: gateways } = useGateways();
  const [activeStakes, setActiveStakes] =
    useState<Array<ActiveStakesTableData>>();
  const [pendingWithdrawals, setPendingWithdrawals] =
    useState<Array<PendingWithdrawalsTableData>>();

  const [tableMode, setTableMode] = useState<TableMode>('activeStakes');

  const [showWithdrawAllModal, setShowWithdrawAllModal] = useState(false);
  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();
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

  const navigate = useNavigate();

  const { data: delegateStakes } = useDelegateStakes(walletAddress?.toString());

  useEffect(() => {
    const activeStakes: Array<ActiveStakesTableData> | undefined = isFetching
      ? undefined
      : !delegateStakes || !gateways
        ? []
        : delegateStakes.stakes
            .filter((stake) => stake.balance > 0)
            .map((stake) => {
              const gateway = gateways[stake.gatewayAddress];
              return {
                owner: stake.gatewayAddress,
                delegatedStake: stake.balance,
                gateway,
                pendingWithdrawals: delegateStakes.withdrawals.filter(
                  (w) => w.gatewayAddress == stake.gatewayAddress,
                ).length,
                streak:
                  gateway.status == 'leaving'
                    ? Number.NEGATIVE_INFINITY
                    : gateway.stats.failedConsecutiveEpochs > 0
                      ? -gateway.stats.failedConsecutiveEpochs
                      : gateway.stats.passedConsecutiveEpochs,
              };
            });

    const pendingWithdrawals: Array<PendingWithdrawalsTableData> | undefined =
      isFetching
        ? undefined
        : !delegateStakes || !gateways
          ? []
          : delegateStakes.withdrawals.map((withdrawal) => {
              const gateway = gateways[withdrawal.gatewayAddress];

              return {
                owner: withdrawal.gatewayAddress,
                gateway,
                withdrawal,
                withdrawalId: withdrawal.vaultId,
              };
            });

    setActiveStakes(activeStakes);
    setPendingWithdrawals(pendingWithdrawals);
  }, [delegateStakes, gateways, isFetching]);

  // Define columns for the active stakes table
  const activeStakesColumns: ColumnDef<ActiveStakesTableData, any>[] = [
    columnHelper.accessor('gateway.settings.label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelper.accessor('gateway.settings.fqdn', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
      cell: ({ row }) => (
        <div className="text-gradient">
          <a
            href={`https://${row.getValue('domain')}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {row.getValue('domain')}
          </a>{' '}
        </div>
      ),
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
      cell: ({ row }) => <AddressCell address={row.getValue('owner')} />,
    }),
    columnHelper.accessor('delegatedStake', {
      id: 'delegatedStake',
      header: `Current Stake (${ticker})`,
      sortDescFirst: true,
      cell: ({ row }) => {
        return `${new mARIOToken(row.original.delegatedStake).toARIO().valueOf()}`;
      },
    }),
    columnHelper.accessor('streak', {
      id: 'streak',
      header: 'Streak',
      sortDescFirst: true,
      cell: ({ row }) => <Streak streak={row.original.streak} />,
    }),
    columnHelper.accessor('pendingWithdrawals', {
      id: 'pendingWithdrawals',
      header: 'Pending Withdrawals',
      sortDescFirst: true,
      cell: ({ row }) => (
        <div
          className={
            row.original.pendingWithdrawals > 0 ? 'text-high' : 'text-low'
          }
        >
          {`${row.original.pendingWithdrawals}`}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'action',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="flex w-full justify-end pr-6">
            <Button
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Manage Stake"
              text=" "
              rightIcon={<GearIcon className="size-4" />}
              onClick={(e) => {
                e.stopPropagation();
                setStakingModalWalletAddress(row.original.owner);
              }}
            />
          </div>
        );
      },
    }),
  ];

  const hasDelegatedStake =
    activeStakes?.some((v) => v.delegatedStake > 0) ?? false;

  // Define columns for the pending withdrawals table
  const pendingWithdrawalsColumns: ColumnDef<
    PendingWithdrawalsTableData,
    any
  >[] = [
    columnHelperWithdrawals.accessor('gateway.settings.label', {
      id: 'label',
      header: 'Label',
      sortDescFirst: false,
    }),
    columnHelperWithdrawals.accessor('gateway.settings.fqdn', {
      id: 'domain',
      header: 'Domain',
      sortDescFirst: false,
      cell: ({ row }) => (
        <div className="text-gradient">
          <a
            href={`https://${row.getValue('domain')}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {row.getValue('domain')}
          </a>{' '}
        </div>
      ),
    }),
    columnHelperWithdrawals.accessor('owner', {
      id: 'owner',
      header: 'Address',
      sortDescFirst: false,
      cell: ({ row }) => <AddressCell address={row.getValue('owner')} />,
    }),
    columnHelperWithdrawals.accessor('withdrawal.balance', {
      id: 'withdrawal',
      header: `Stake Withdrawing (${ticker})`,
      sortDescFirst: true,
      cell: ({ row }) => {
        return `${new mARIOToken(row.original.withdrawal.balance).toARIO().valueOf()}`;
      },
    }),
    columnHelperWithdrawals.accessor((row) => row.withdrawal.endTimestamp, {
      id: 'endDate',
      header: `Date Returning`,
      sortDescFirst: true,
      cell: ({ row }) => {
        return `${dayjs(new Date(row.original.withdrawal.endTimestamp)).format('YYYY-MM-DD')}`;
      },
    }),
    columnHelperWithdrawals.display({
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
                setConfirmInstantWithdrawal({
                  gateway: row.original.gateway,
                  gatewayAddress: row.original.owner,
                  vault: row.original.withdrawal,
                  vaultId: row.original.withdrawalId,
                });
              }}
            />
            <Button
              buttonType={ButtonType.SECONDARY}
              active={true}
              title="Cancel Withdrawal"
              text={<CancelButtonXIcon className="size-4" />}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmCancelWithdrawal({
                  gatewayAddress: row.original.owner,
                  vaultId: row.original.withdrawalId,
                });
              }}
            />
          </div>
        );
      },
    }),
  ];

  return (
    <div>
      <div
        className={`flex w-full items-center gap-4 rounded-t-xl border border-grey-600 bg-containerL3 px-6 ${tableMode == 'activeStakes' ? 'py-2' : 'py-[0.9375rem]'} `}
      >
        <div className="grow text-sm text-mid">
          <Dropdown
            options={[
              { label: 'Active Stakes', value: 'activeStakes' },
              { label: 'Pending Withdrawals', value: 'pendingWithdrawals' },
            ]}
            onChange={(e) => {
              setTableMode(e.target.value as TableMode);
            }}
            value={tableMode}
            tightPadding={true}
          />
        </div>

        {tableMode == 'activeStakes' && hasDelegatedStake && (
          <Button
            buttonType={ButtonType.SECONDARY}
            className="*:text-gradient-red h-[1.875rem]"
            active={true}
            title="Withdraw All"
            text="Withdraw All"
            onClick={() => setShowWithdrawAllModal(true)}
          />
        )}
      </div>
      {tableMode === 'activeStakes' ? (
        <TableView
          key="activeStakesTable"
          columns={activeStakesColumns}
          data={activeStakes || []}
          isLoading={isFetching || activeStakes === undefined}
          noDataFoundText="No active stakes found."
          defaultSortingState={{
            id: 'delegatedStake',
            desc: true,
          }}
          onRowClick={(row) => {
            navigate(`/gateways/${row.owner}`);
          }}
        />
      ) : (
        <TableView
          key="pendingWithdrawalsTable"
          columns={pendingWithdrawalsColumns}
          data={pendingWithdrawals || []}
          isLoading={isFetching || pendingWithdrawals === undefined}
          noDataFoundText="No pending withdrawals found."
          defaultSortingState={{
            id: 'label',
            desc: true,
          }}
          onRowClick={(row) => {
            navigate(`/gateways/${row.owner}`);
          }}
        />
      )}
      {showWithdrawAllModal && activeStakes !== undefined && (
        <WithdrawAllModal
          activeStakes={activeStakes}
          onClose={() => setShowWithdrawAllModal(false)}
        />
      )}
      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => {
            setStakingModalWalletAddress(undefined);
          }}
          ownerWallet={stakingModalWalletAddress}
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
    </div>
  );
};

export default MyStakesTable;
