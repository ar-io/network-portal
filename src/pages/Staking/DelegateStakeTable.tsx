import { mARIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import ColumnSelector from '@src/components/ColumnSelector';
import CopyButton from '@src/components/CopyButton';
import ServerSortableTableView from '@src/components/ServerSortableTableView';
import Streak from '@src/components/Streak';
import Tooltip from '@src/components/Tooltip';
import {
  CaretDoubleRightIcon,
  CaretRightIcon,
  InfoIcon,
} from '@src/components/icons';
import ConnectModal from '@src/components/modals/ConnectModal';
import StakingModal from '@src/components/modals/StakingModal';
import { EAY_TOOLTIP_FORMULA, EAY_TOOLTIP_TEXT } from '@src/constants';
import usePaginatedGateways from '@src/hooks/usePaginatedGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
} from '@tanstack/react-table';
import { MathJax } from 'better-react-mathjax';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  streak: number;
  rewardShareRatio: number;
  performance: number;
  passedEpochCount: number;
  totalEpochCount: number;
  totalDelegatedStake: number;
  totalStake: number;
  operatorStake: number;
  eay: number;
}

const columnHelper = createColumnHelper<TableData>();
const ITEMS_PER_PAGE = 25;

const DelegateStake = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    | 'settings.label'
    | 'settings.fqdn'
    | 'gatewayAddress'
    | 'totalDelegatedStake'
    | 'operatorStake'
  >('totalDelegatedStake');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    isLoading,
    isError,
    data: gatewaysData,
  } = usePaginatedGateways({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy,
    sortOrder,
    filters: {
      status: 'joined',
      'settings.allowDelegatedStaking': true,
    },
  });
  const { data: protocolBalance } = useProtocolBalance();
  const [delegateGateways, setDelegateGateways] = useState<Array<TableData>>(
    [],
  );

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!gatewaysData?.items || !protocolBalance) {
      setDelegateGateways([]);
      return;
    }

    const protocolBalanceARIO = new mARIOToken(protocolBalance).toARIO();
    const joinedGatewayCount = gatewaysData.totalItems;

    const delegateGateways: Array<TableData> = gatewaysData.items.map(
      (gateway) => {
        const passedEpochCount = gateway.stats.passedEpochCount;
        const totalEpochCount = gateway.stats.totalEpochCount;

        // Pre-calculate token conversions
        const totalDelegatedStakeARIO = new mARIOToken(
          gateway.totalDelegatedStake,
        )
          .toARIO()
          .valueOf();
        const operatorStakeARIO = new mARIOToken(gateway.operatorStake)
          .toARIO()
          .valueOf();

        return {
          label: gateway.settings.label,
          domain: gateway.settings.fqdn,
          owner: gateway.gatewayAddress,
          streak:
            gateway.stats.failedConsecutiveEpochs > 0
              ? -gateway.stats.failedConsecutiveEpochs
              : gateway.stats.passedConsecutiveEpochs,
          rewardShareRatio: gateway.settings.delegateRewardShareRatio,
          performance:
            totalEpochCount > 0 ? passedEpochCount / totalEpochCount : -1,
          passedEpochCount,
          totalEpochCount,
          totalDelegatedStake: totalDelegatedStakeARIO,
          operatorStake: operatorStakeARIO,
          totalStake: totalDelegatedStakeARIO + operatorStakeARIO,
          eay: calculateGatewayRewards(
            protocolBalanceARIO,
            joinedGatewayCount,
            gateway,
          ).EAY,
        };
      },
    );
    setDelegateGateways(delegateGateways);
  }, [gatewaysData, protocolBalance]);

  const sortMapping: Record<string, string> = {
    label: 'settings.label',
    domain: 'settings.fqdn',
    owner: 'gatewayAddress',
    totalStake: 'totalDelegatedStake',
  };

  const handleSortingChange = (sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];

      const newSortBy = sortMapping[id];
      if (newSortBy) {
        setSortBy(newSortBy as any);
        setSortOrder(desc ? 'desc' : 'asc');
        setCurrentPage(1); // Reset to first page when sorting changes
      }
    }
  };

  // Define columns for the table
  const columns = useMemo<ColumnDef<TableData, any>[]>(
    () => [
      columnHelper.accessor('label', {
        id: 'label',
        header: 'Label',
        sortDescFirst: false,
      }),
      columnHelper.accessor('domain', {
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
      columnHelper.accessor('totalStake', {
        id: 'totalStake',
        header: `Total Stake (${ticker})`,
        sortDescFirst: true,
        cell: ({ row }) => (
          <Tooltip
            message={
              <div>
                <div>
                  Operator Stake: {formatWithCommas(row.original.operatorStake)}{' '}
                  {ticker}
                </div>
                <div className="mt-1">
                  Delegated Stake:{' '}
                  {formatWithCommas(row.original.totalDelegatedStake)} {ticker}
                </div>
              </div>
            }
          >
            {formatWithCommas(row.getValue('totalStake'))}
          </Tooltip>
        ),
      }),
      columnHelper.accessor('rewardShareRatio', {
        id: 'rewardShareRatio',
        header: 'Reward Share Ratio',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.rewardShareRatio >= 0
            ? `${row.original.rewardShareRatio}%`
            : 'N/A',
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
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            {row.original.eay < 0
              ? 'N/A'
              : `${formatWithCommas(row.original.eay * 100)}%`}
          </div>
        ),
      }),
      columnHelper.accessor('performance', {
        id: 'performance',
        header: 'Performance',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.performance < 0 ? (
            'N/A'
          ) : (
            <Tooltip
              message={
                <div>
                  <div>Passed Epoch Count: {row.original.passedEpochCount}</div>
                  <div className="mt-1">
                    Total Epoch Participation Count:{' '}
                    {row.original.totalEpochCount}
                  </div>
                </div>
              }
            >
              {`${(row.original.performance * 100).toFixed(2)}%`}
            </Tooltip>
          ),
      }),

      columnHelper.accessor('streak', {
        id: 'streak',
        header: 'Streak',
        enableSorting: false,
        cell: ({ row }) => <Streak streak={row.original.streak} />,
      }),

      columnHelper.display({
        id: 'action',
        header: '',
        cell: ({ row }) => {
          const ownGateway = row.original.owner === walletAddress?.toString();
          const btn = (
            <Button
              buttonType={ButtonType.PRIMARY}
              active={true}
              title="Manage Stake"
              text="Stake"
              onClick={(e) => {
                e.stopPropagation();
                if (walletAddress) {
                  if (!ownGateway) {
                    setStakingModalWalletAddress(
                      row.getValue('owner') as string,
                    );
                  }
                } else {
                  setIsConnectModalOpen(true);
                }
              }}
            />
          );
          return (
            <div className="pr-6">
              {ownGateway ? (
                <Tooltip message="Delegate staking is not supported for gateways you operate. Please use operator staking on your gateway details page.">
                  <div className="pointer-events-none opacity-30">{btn}</div>
                </Tooltip>
              ) : (
                btn
              )}
            </div>
          );
        },
      }),
    ],
    [
      ticker,
      walletAddress,
      setStakingModalWalletAddress,
      setIsConnectModalOpen,
    ],
  );

  return (
    <div>
      <div className="flex w-full items-center justify-between rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-3">
        <div className="text-sm text-mid">
          Delegate Stake{' '}
          {gatewaysData?.totalItems ? `(${gatewaysData.totalItems})` : ''}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
              aria-label="First page"
            >
              <CaretDoubleRightIcon className="h-4 w-4 rotate-180" />
            </button>

            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
              aria-label="Previous page"
            >
              <CaretRightIcon className="h-4 w-4 rotate-180" />
            </button>

            <span className="text-xs text-mid">
              Page {currentPage} of {gatewaysData?.totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!gatewaysData?.hasNextPage}
              className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
              aria-label="Next page"
            >
              <CaretRightIcon className="h-4 w-4" />
            </button>

            <button
              onClick={() => setCurrentPage(gatewaysData?.totalPages || 1)}
              disabled={currentPage === (gatewaysData?.totalPages || 1)}
              className="rounded-md bg-containerL2 p-1 text-mid transition-all hover:bg-containerL1 disabled:opacity-50"
              aria-label="Last page"
            >
              <CaretDoubleRightIcon className="h-4 w-4" />
            </button>
          </div>

          <ColumnSelector tableId="delegate-stake" columns={columns} />
        </div>
      </div>
      <ServerSortableTableView
        columns={columns}
        data={delegateGateways}
        isLoading={isLoading}
        isError={isError}
        noDataFoundText="No gateways with delegate staking enabled found."
        errorText="Unable to load delegate stakes."
        loadingRows={ITEMS_PER_PAGE}
        defaultSortingState={{ id: 'totalStake', desc: true }}
        onRowClick={(row) => {
          navigate(`/gateways/${row.owner}`);
        }}
        onSortingChange={handleSortingChange}
        currentSorting={[
          {
            id:
              Object.keys(sortMapping).find(
                (key) => sortMapping[key] === sortBy,
              ) || 'totalStake',
            desc: sortOrder === 'desc',
          },
        ]}
        tableId="delegate-stake"
      />
      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => setStakingModalWalletAddress(undefined)}
          ownerWallet={stakingModalWalletAddress}
        />
      )}

      {isConnectModalOpen && (
        <ConnectModal onClose={() => setIsConnectModalOpen(false)} />
      )}
    </div>
  );
};

export default DelegateStake;
