import { mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import TableView from '@src/components/TableView';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import { EAY_TOOLTIP_TEXT } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface TableData {
  label: string;
  domain: string;
  owner: string;
  failedConsecutiveEpochs: number;
  rewardRatio: number;
  eay: number;
}

const columnHelper = createColumnHelper<TableData>();

const DelegateStake = () => {
  const walletAddress = useGlobalState((state) => state.walletAddress);

  const { isLoading, data: gateways } = useGateways();
  const [stakeableGateways, setStakeableGateways] = useState<Array<TableData>>(
    [],
  );

  const [stakingModalWalletAddress, setStakingModalWalletAddress] =
    useState<string>();

  const { data: protocolBalance } = useProtocolBalance();

  useEffect(() => {
    const stakeableGateways: Array<TableData> =
      !walletAddress || !gateways || !protocolBalance
        ? []
        : Object.entries(gateways).reduce((acc, [owner, gateway]) => {
            if (gateway.settings.allowDelegatedStaking) {
              return [
                ...acc,
                {
                  label: gateway.settings.label,
                  domain: gateway.settings.fqdn,
                  owner,
                  failedConsecutiveEpochs:
                    gateway.stats.failedConsecutiveEpochs,
                  rewardRatio: gateway.settings.delegateRewardShareRatio,
                  eay: calculateGatewayRewards(
                    new mIOToken(protocolBalance).toIO(),
                    Object.keys(gateways).length,
                    gateway,
                  ).EAY,
                },
              ];
            }
            return acc;
          }, [] as Array<TableData>);
    setStakeableGateways(stakeableGateways);
  }, [gateways, protocolBalance, walletAddress]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
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
    columnHelper.accessor('failedConsecutiveEpochs', {
      id: 'failedConsecutiveEpochs',
      header: 'Offline Epochs',
      sortDescFirst: true,
    }),
    columnHelper.accessor('rewardRatio', {
      id: 'rewardRatio',
      header: 'Reward Ratio',
      sortDescFirst: true,
    }),
    columnHelper.accessor('eay', {
      id: 'eay',
      header: () => (
        <div className="flex gap-[4px]">
          EAY
          <Tooltip message={EAY_TOOLTIP_TEXT}>
            <InfoIcon className="h-full" />
          </Tooltip>
        </div>
      ),
      sortDescFirst: true,
      cell: ({ row }) => (
        <div>
          {row.original.eay < 0
            ? 'N/A'
            : `${formatWithCommas(row.original.eay)}%`}
        </div>
      ),
    }),

    columnHelper.display({
      id: 'action',
      header: '',
      cell: ({ row }) => {
        return (
          <div className="pr-[24px]">
            <Button
              buttonType={ButtonType.PRIMARY}
              active={true}
              title="Stake"
              text="Stake"
              onClick={() => {
                setStakingModalWalletAddress(row.getValue('owner') as string);
              }}
            />
          </div>
        );
      },
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Delegate Stake</div>
      </div>
      <TableView
        columns={columns}
        data={stakeableGateways}
        isLoading={isLoading}
        noDataFoundText="No stakeable gateways found."
        defaultSortingState={{ id: 'rewardRatio', desc: true }}
      />
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

export default DelegateStake;
