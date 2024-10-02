import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import TableView from '@src/components/TableView';
import { GearIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import UnstakeAllModal from '@src/components/modals/UnstakeAllModal';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TableData {
  owner: string;
  delegatedStake: number;
  gateway: AoGateway;
  pendingWithdrawals: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveStakes = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const ticker = useGlobalState((state) => state.ticker);

  const { isLoading, data: gateways } = useGateways();
  const [activeStakes, setActiveStakes] = useState<Array<TableData>>([]);

  const [showUnstakeAllModal, setShowUnstakeAllModal] = useState(false);
  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();
  const [showQuickStake, setShowQuickStake] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const activeStakes: Array<TableData> =
      !walletAddress || !gateways
        ? ([] as Array<TableData>)
        : Object.keys(gateways).reduce((acc, key) => {
            const gateway = gateways[key];
            const delegate = gateway.delegates[walletAddress?.toString()];

            if (delegate) {
              return [
                ...acc,
                {
                  owner: key,
                  delegatedStake: delegate.delegatedStake,
                  gateway,
                  pendingWithdrawals: Object.keys(delegate.vaults).length,
                },
              ];
            }
            return acc;
          }, [] as Array<TableData>);
    setActiveStakes(activeStakes);
  }, [gateways, walletAddress]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
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
        return `${new mIOToken(row.original.delegatedStake).toIO().valueOf()}`;
      },
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
        );
      },
    }),
  ];

  const hasDelegatedStake =
    activeStakes?.some((v) => v.delegatedStake > 0) ?? false;

  return (
    <div>
      <div className="flex w-full items-center gap-4 rounded-t-xl border border-grey-600 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Active Stakes</div>
        {hasDelegatedStake && (
          <Button
            buttonType={ButtonType.SECONDARY}
            className="*:text-gradient-red h-[1.875rem]"
            active={true}
            title="Withdraw All"
            text="Withdraw All"
            onClick={() => setShowUnstakeAllModal(true)}
          />
        )}
          <Button
            buttonType={ButtonType.SECONDARY}
            className="*:text-gradient h-[1.875rem]"
            active={true}
            title="QuickStake"
            text="QuickStake"
            onClick={() => setShowQuickStake(true)}
          />
      </div>
      <TableView
        columns={columns}
        data={activeStakes}
        isLoading={isLoading}
        noDataFoundText="No active stakes found."
        defaultSortingState={{
          id: 'delegatedStake',
          desc: true,
        }}
        onRowClick={(row) => {
          navigate(`/gateways/${row.owner}`);
        }}
      />
      {showUnstakeAllModal && (
        <UnstakeAllModal
          activeStakes={activeStakes}
          onClose={() => setShowUnstakeAllModal(false)}
        />
      )}
      {(stakingModalWalletAddress || showQuickStake) && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => {
            setStakingModalWalletAddress(undefined);
            setShowQuickStake(false);
          }}
          ownerWallet={stakingModalWalletAddress}
        />
      )}
    </div>
  );
};

export default ActiveStakes;
