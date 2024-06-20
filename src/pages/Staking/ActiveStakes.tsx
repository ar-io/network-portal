import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import Button, { ButtonType } from '@src/components/Button';
import TableView from '@src/components/TableView';
import { GearIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import UnstakeAllModal from '@src/components/modals/UnstakeAllModal';
import { IO_LABEL } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface TableData {
  owner: string;
  delegatedStake: number;
  gateway: AoGateway;
  pendingWithdrawals: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveStakes = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const { isLoading, data: gateways } = useGateways();
  const [activeStakes, setActiveStakes] = useState<Array<TableData>>([]);

  const [showUnstakeAllModal, setShowUnstakeAllModal] = useState(false);
  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

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
      header: `Current Stake (${IO_LABEL})`,
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
            title="Unstake"
            text=" "
            rightIcon={<GearIcon />}
            onClick={() => {
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
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Active Stakes</div>
        {hasDelegatedStake && (
          <Button
            buttonType={ButtonType.SECONDARY}
            className="*:text-gradient h-[30px]"
            active={true}
            title="Withdraw All"
            text="Withdraw All"
            onClick={() => setShowUnstakeAllModal(true)}
          />
        )}
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
      />
      {showUnstakeAllModal && (
        <UnstakeAllModal
          activeStakes={activeStakes}
          onClose={() => setShowUnstakeAllModal(false)}
        />
      )}
      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => setStakingModalWalletAddress(undefined)}
          ownerWallet={stakingModalWalletAddress}
        />
      )}
    </div>
  );
};

export default ActiveStakes;
