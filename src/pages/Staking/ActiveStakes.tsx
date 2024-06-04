import { Gateway } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import TableView from '@src/components/TableView';
import { GearIcon } from '@src/components/icons';
import BlockingMessageModal from '@src/components/modals/BlockingMessageModal';
import StakingModal from '@src/components/modals/StakingModal';
import SuccessModal from '@src/components/modals/SuccessModal';
import { log } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface TableData {
  owner: string;
  delegatedStake: number;
  gateway: Gateway;
  pendingWithdrawals: number;
}

const columnHelper = createColumnHelper<TableData>();

const ActiveStakes = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const { isLoading, data: gateways } = useGateways();
  const [activeStakes, setActiveStakes] = useState<Array<TableData>>([]);

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
  const columns = [
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
      cell: ({ row }) => (
        <div className="text-mid">
          <a
            href={`https://viewblock.io/arweave/address/${row.getValue('owner')}`}
            target="_blank"
            rel="noreferrer"
          >
            {row.getValue('owner')}
          </a>
        </div>
      ),
    }),
    columnHelper.accessor('delegatedStake', {
      id: 'delegatedStake',
      header: 'Current Stake',
      sortDescFirst: true,
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

  const withdrawAll = async () => {
    if (walletAddress && arIOWriteableSDK && hasDelegatedStake) {
      setShowBlockingMessageModal(true);

      try {
        for (const stake of activeStakes) {
          if (stake.delegatedStake > 0) {
            const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake({
              target: stake.owner,
              qty: stake.delegatedStake, // read and write value both in mIO
            });

            log.info(`Decrease Delegate Stake txID: ${txID}`);
          }
        }

        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

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
            onClick={withdrawAll}
          />
        )}
      </div>
      <TableView
        columns={columns as ColumnDef<TableData, unknown>[]}
        data={activeStakes}
        isLoading={isLoading}
        noDataFoundText='No active stakes found.'
        defaultSortingState={{
          id: 'delegatedStake',
          desc: true,
        }}
      />
      {stakingModalWalletAddress && (
        <StakingModal
          open={!!stakingModalWalletAddress}
          onClose={() => setStakingModalWalletAddress(undefined)}
          ownerWallet={stakingModalWalletAddress}
        />
      )}
      {showBlockingMessageModal && (
        <BlockingMessageModal
          onClose={() => setShowBlockingMessageModal(false)}
          message="Sign the following data with your wallet to proceed."
        ></BlockingMessageModal>
      )}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false);
          }}
          title="Congratulations"
          bodyText="You have successfully withdrawn all stakes."
        />
      )}
    </div>
  );
};

export default ActiveStakes;
