import { AoGatewayWithAddress, AoVaultData, mARIOToken } from '@ar.io/sdk/web';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import ColumnSelector from '@src/components/ColumnSelector';
import CopyButton from '@src/components/CopyButton';
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
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UnifiedStakeData {
  owner: string;
  gateway: AoGatewayWithAddress;
  amount: number;
  status: 'Active' | 'Withdrawing';
  streak?: number;
  eay?: number;
  withdrawalDate?: Date;
  withdrawalId?: string;
  withdrawal?: AoVaultData;
}

const columnHelper = createColumnHelper<UnifiedStakeData>();

const MyStakesTable = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const { isFetching, isError: gatewaysError, data: gateways } = useGateways();
  const [unifiedStakes, setUnifiedStakes] = useState<Array<UnifiedStakeData>>();

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

  const { isError: delegateStakesError, data: delegateStakes } =
    useDelegateStakes(walletAddress?.toString());

  const { data: protocolBalance } = useProtocolBalance();

  useEffect(() => {
    const unified: Array<UnifiedStakeData> | undefined = isFetching
      ? undefined
      : !delegateStakes || !gateways || !protocolBalance
        ? []
        : [
            // Active stakes
            ...delegateStakes.stakes
              .filter((stake) => stake.balance > 0)
              .map((stake) => {
                const gateway = gateways[stake.gatewayAddress];
                return {
                  owner: stake.gatewayAddress,
                  gateway: { ...gateway, gatewayAddress: stake.gatewayAddress },
                  amount: stake.balance,
                  status: 'Active' as const,
                  streak:
                    gateway.status === 'leaving'
                      ? Number.NEGATIVE_INFINITY
                      : gateway.stats.failedConsecutiveEpochs > 0
                        ? -gateway.stats.failedConsecutiveEpochs
                        : gateway.stats.passedConsecutiveEpochs,
                  eay: calculateGatewayRewards(
                    new mARIOToken(protocolBalance).toARIO(),
                    Object.values(gateways).filter((g) => g.status === 'joined')
                      .length,
                    gateway,
                  ).EAY,
                };
              }),
            // Pending withdrawals
            ...delegateStakes.withdrawals.map((withdrawal) => {
              const gateway = gateways[withdrawal.gatewayAddress];
              return {
                owner: withdrawal.gatewayAddress,
                gateway: {
                  ...gateway,
                  gatewayAddress: withdrawal.gatewayAddress,
                },
                amount: withdrawal.balance,
                status: 'Withdrawing' as const,
                withdrawalDate: new Date(withdrawal.endTimestamp),
                withdrawalId: withdrawal.vaultId,
                withdrawal,
              };
            }),
          ];

    setUnifiedStakes(unified);
  }, [delegateStakes, gateways, isFetching, protocolBalance]);

  // Define columns for the unified stakes table
  const columns: ColumnDef<UnifiedStakeData, any>[] = useMemo(
    () => [
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        sortDescFirst: false,
        cell: ({ row }) => (
          <div
            className={
              row.original.status === 'Active' ? 'text-primary' : 'text-warning'
            }
          >
            {row.original.status}
          </div>
        ),
      }),
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
      columnHelper.accessor('amount', {
        id: 'amount',
        header: `Amount (${ticker})`,
        sortDescFirst: true,
        cell: ({ row }) => {
          return `${new mARIOToken(row.original.amount).toARIO().valueOf()}`;
        },
      }),
      columnHelper.accessor('eay', {
        id: 'eay',
        meta: {
          displayName: 'Delegate EAY',
        },
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
            {row.original.status === 'Withdrawing' ||
            !row.original.eay ||
            row.original.eay < 0
              ? 'N/A'
              : `${formatWithCommas(row.original.eay * 100)}%`}
          </div>
        ),
      }),
      columnHelper.accessor('streak', {
        id: 'streak',
        header: 'Streak',
        sortDescFirst: true,
        cell: ({ row }) =>
          row.original.status === 'Withdrawing' ? (
            <span className="text-low">N/A</span>
          ) : (
            <Streak streak={row.original.streak!} />
          ),
      }),
      columnHelper.accessor('withdrawalDate', {
        id: 'withdrawalDate',
        header: 'Withdrawal Date',
        sortDescFirst: true,
        cell: ({ row }) => (
          <div
            className={row.original.withdrawalDate ? 'text-high' : 'text-low'}
          >
            {row.original.withdrawalDate
              ? dayjs(row.original.withdrawalDate).format('YYYY-MM-DD')
              : 'N/A'}
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
                  {row.original.status === 'Active' ? (
                    <>
                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStakingModalWalletAddress(row.original.owner);
                        }}
                      >
                        Add Stake
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWithdrawalModalWalletAddress(row.original.owner);
                        }}
                      >
                        Withdraw Stake
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRedelegateModal({
                            sourceGateway: row.original.gateway,
                            onClose: () => setShowRedelegateModal(undefined),
                            maxRedelegationStake: new mARIOToken(
                              row.original.amount,
                            ).toARIO(),
                          });
                        }}
                      >
                        Redelegate
                      </DropdownMenu.Item>
                    </>
                  ) : (
                    <>
                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmInstantWithdrawal({
                            gateway: row.original.gateway,
                            gatewayAddress: row.original.owner,
                            vault: row.original.withdrawal!,
                            vaultId: row.original.withdrawalId!,
                          });
                        }}
                      >
                        Expedite Withdrawal
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmCancelWithdrawal({
                            gatewayAddress: row.original.owner,
                            vaultId: row.original.withdrawalId!,
                          });
                        }}
                      >
                        Cancel Withdrawal
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="cursor-pointer select-none px-4 py-2 outline-none data-[highlighted]:bg-containerL3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRedelegateModal({
                            sourceGateway: row.original.gateway,
                            onClose: () => setShowRedelegateModal(undefined),
                            maxRedelegationStake: new mARIOToken(
                              row.original.amount,
                            ).toARIO(),
                            vaultId: row.original.withdrawalId,
                          });
                        }}
                      >
                        Redelegate
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          );
        },
      }),
    ],
    [
      ticker,
      setStakingModalWalletAddress,
      setWithdrawalModalWalletAddress,
      setShowRedelegateModal,
    ],
  );

  const hasDelegatedStake =
    unifiedStakes?.some((v) => v.status === 'Active' && v.amount > 0) ?? false;

  return (
    <div>
      <div className="flex w-full items-center gap-4 rounded-t-xl border border-grey-600 bg-containerL3 pl-6 pr-3 py-2">
        <div className="grow text-sm text-mid">My Stakes</div>

        <div className="flex items-center gap-3">
          {hasDelegatedStake && (
            <Button
              buttonType={ButtonType.SECONDARY}
              className="*:text-gradient-red h-[1.875rem]"
              active={true}
              title="Withdraw All"
              text="Withdraw All"
              onClick={() => setShowWithdrawAllModal(true)}
            />
          )}

          <ColumnSelector tableId="my-stakes-unified" columns={columns} />
        </div>
      </div>
      <TableView
        key="unifiedStakesTable"
        columns={columns}
        data={unifiedStakes || []}
        isLoading={isFetching || unifiedStakes === undefined}
        isError={gatewaysError || delegateStakesError}
        noDataFoundText="No stakes found."
        errorText="Unable to load stakes."
        loadingRows={10}
        defaultSortingState={{
          id: 'amount',
          desc: true,
        }}
        onRowClick={(row) => {
          navigate(`/gateways/${row.owner}`);
        }}
        tableId="my-stakes-unified"
      />
      {showWithdrawAllModal && unifiedStakes !== undefined && (
        <WithdrawAllModal
          activeStakes={unifiedStakes
            .filter((s) => s.status === 'Active')
            .map((s) => ({
              owner: s.owner,
              delegatedStake: s.amount,
              gateway: s.gateway,
            }))}
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
