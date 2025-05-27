import { AoGatewayWithAddress, AoVaultData, mARIOToken } from '@ar.io/sdk/web';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import CopyButton from '@src/components/CopyButton';
import Dropdown from '@src/components/Dropdown';
import Streak from '@src/components/Streak';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon, ThreeDotsIcon } from '@src/components/icons';
import CancelWithdrawalModal from '@src/components/modals/CancelWithdrawalModal';
import InstantWithdrawalModal from '@src/components/modals/InstantWithdrawalModal';
import RedelegateModal, {
  RedelegateModalProps,
} from '@src/components/modals/RedelegateModal';
import StakeWithdrawalModal from '@src/components/modals/StakeWithdrawalModal';
import StakingModal from '@src/components/modals/StakingModal';
import WithdrawAllModal from '@src/components/modals/WithdrawAllModal';
import { EAY_TOOLTIP_FORMULA, EAY_TOOLTIP_TEXT } from '@src/constants';
import useDelegateStakes from '@src/hooks/useDelegateStakes';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MathJax } from 'better-react-mathjax';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ActiveStakesTableData {
  owner: string;
  delegatedStake: number;
  gateway: AoGatewayWithAddress;
  pendingWithdrawals: number;
  streak: number;
  eay: number;
}

interface PendingWithdrawalsTableData {
  owner: string;
  gateway: AoGatewayWithAddress;
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
  const [withdrawalModalWalletAddress, setWithdrawalModalWalletAddress] =
    useState<string>();
  const [showRedelegateModal, setShowRedelegateModal] =
    useState<RedelegateModalProps>();

  const [confirmCancelWithdrawal, setConfirmCancelWithdrawal] = useState<{
    gatewayAddress: string;
    vaultId: string;
  }>();

  const [confirmInstantWithdrawal, setConfirmInstantWithdrawal] = useState<{
    gatewayAddress: string;
    gateway: AoGatewayWithAddress;
    vault: AoVaultData;
    vaultId: string;
  }>();

  const navigate = useNavigate();

  const { data: delegateStakes } = useDelegateStakes(walletAddress?.toString());

  const { data: protocolBalance } = useProtocolBalance();

  useEffect(() => {
    const activeStakes: Array<ActiveStakesTableData> | undefined = isFetching
      ? undefined
      : !delegateStakes || !gateways || !protocolBalance
        ? []
        : delegateStakes.stakes
            .filter((stake) => stake.balance > 0)
            .map((stake) => {
              const gateway = gateways[stake.gatewayAddress];
              return {
                owner: stake.gatewayAddress,
                delegatedStake: stake.balance,
                gateway: { ...gateway, gatewayAddress: stake.gatewayAddress },
                pendingWithdrawals: delegateStakes.withdrawals.filter(
                  (w) => w.gatewayAddress == stake.gatewayAddress,
                ).length,
                streak:
                  gateway.status == 'leaving'
                    ? Number.NEGATIVE_INFINITY
                    : gateway.stats.failedConsecutiveEpochs > 0
                      ? -gateway.stats.failedConsecutiveEpochs
                      : gateway.stats.passedConsecutiveEpochs,
                eay: calculateGatewayRewards(
                  new mARIOToken(protocolBalance).toARIO(),
                  Object.values(gateways).filter((g) => g.status == 'joined')
                    .length,
                  gateway,
                ).EAY,
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
                gateway: {
                  ...gateway,
                  gatewayAddress: withdrawal.gatewayAddress,
                },
                withdrawal,
                withdrawalId: withdrawal.vaultId,
              };
            });

    setActiveStakes(activeStakes);
    setPendingWithdrawals(pendingWithdrawals);
  }, [delegateStakes, gateways, isFetching, protocolBalance]);

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
        <div className="flex items-center gap-2">
          <a
            href={`https://${row.getValue('domain')}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-gradient"
          >
            {row.getValue('domain')}
          </a>
          <CopyButton textToCopy={row.getValue('domain')} />
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
    columnHelper.accessor('eay', {
      id: 'eay',
      header: () => (
        <div className="flex gap-1">
          Delegate EAY
          <Tooltip
            message={
              <div>
                <p>{EAY_TOOLTIP_TEXT}</p>
                <MathJax className="mt-4">{EAY_TOOLTIP_FORMULA}</MathJax>
              </div>
            }
          >
            <InfoIcon className="h-full" />
          </Tooltip>
        </div>
      ),
      sortDescFirst: true,
      cell: ({ row }) => (
        <div>
          {row.original.eay < 0
            ? 'N/A'
            : `${formatWithCommas(row.original.eay * 100)}%`}
        </div>
      ),
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
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cursor-pointer rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end  p-px">
                  <div className="inline-flex size-full items-center justify-start gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.3125rem] py-[.3125rem] shadow-inner">
                    <ThreeDotsIcon className="size-4" />
                  </div>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50 rounded border border-grey-500 bg-containerL0 text-sm">
                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStakingModalWalletAddress(row.original.owner);
                  }}
                >
                  Add Stake
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWithdrawalModalWalletAddress(row.original.owner);
                  }}
                >
                  Withdraw Stake
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none  px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRedelegateModal({
                      sourceGateway: row.original.gateway,
                      onClose: () => setShowRedelegateModal(undefined),
                      maxRedelegationStake: new mARIOToken(
                        row.original.delegatedStake,
                      ).toARIO(),
                    });
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
          <div className="flex w-full justify-end pr-6">
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cursor-pointer rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end  p-px">
                  <div className="inline-flex size-full items-center justify-start gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.3125rem] py-[.3125rem] shadow-inner">
                    <ThreeDotsIcon className="size-4" />
                  </div>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50 rounded border border-grey-500 bg-containerL0 text-sm">
                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmInstantWithdrawal({
                      gateway: row.original.gateway,
                      gatewayAddress: row.original.owner,
                      vault: row.original.withdrawal,
                      vaultId: row.original.withdrawalId,
                    });
                  }}
                >
                  Expedite Withdrawal
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmCancelWithdrawal({
                      gatewayAddress: row.original.owner,
                      vaultId: row.original.withdrawalId,
                    });
                  }}
                >
                  Cancel Withdrawal
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none  px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRedelegateModal({
                      sourceGateway: row.original.gateway,
                      onClose: () => setShowRedelegateModal(undefined),
                      maxRedelegationStake: new mARIOToken(
                        row.original.withdrawal.balance,
                      ).toARIO(),
                      vaultId: row.original.withdrawalId,
                    });
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
      {withdrawalModalWalletAddress && (
        <StakeWithdrawalModal
          open={!!withdrawalModalWalletAddress}
          onClose={() => {
            setWithdrawalModalWalletAddress(undefined);
          }}
          ownerWallet={withdrawalModalWalletAddress}
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
    </div>
  );
};

export default MyStakesTable;
