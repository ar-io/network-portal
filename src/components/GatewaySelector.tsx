import { AoGatewayWithAddress, mARIOToken } from '@ar.io/sdk/web';
import { EAY_TOOLTIP_FORMULA, EAY_TOOLTIP_TEXT } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatAddress, formatPercentage, formatWithCommas } from '@src/utils';
import { calculateGatewayRewards } from '@src/utils/rewards';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MathJax } from 'better-react-mathjax';
import { InfoIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './Button';
import BaseModal from './modals/BaseModal';
import TableView from './TableView';
import Tooltip from './Tooltip';

export type GatewaySelectorProps = {
  selectedGateway?: AoGatewayWithAddress;
  setSelectedGateway: (gateway: AoGatewayWithAddress) => void;
  gateways?: AoGatewayWithAddress[];
};

interface TableData {
  label: string;
  gateway: AoGatewayWithAddress;
  rewardShareRatio: number;
  totalStake: number;
  eay: number;
}

const columnHelper = createColumnHelper<TableData>();

const GatewaySelectorModal = ({
  gateways,
  onClose,
  onGatewaySelected,
}: {
  gateways: AoGatewayWithAddress[];
  onClose: () => void;
  onGatewaySelected: (gateway: AoGatewayWithAddress) => void;
}) => {
  const ticker = useGlobalState((state) => state.ticker);
  const [tableData, setTableData] = useState<TableData[]>([]);

  const { data: prototocolBalance } = useProtocolBalance();
  const { data: totalGateways } = useGateways();

  const [searchText, setSearchText] = useState<string>();

  useEffect(() => {
    if (prototocolBalance && totalGateways && gateways) {
      const tableData: TableData[] = gateways.map((gateway) => {
        return {
          gateway,
          label: gateway.settings.label,
          rewardShareRatio: gateway.settings.delegateRewardShareRatio,
          totalStake: new mARIOToken(gateway.totalDelegatedStake).toARIO().valueOf(),
          eay: calculateGatewayRewards(
            new mARIOToken(prototocolBalance).toARIO(),
            Object.values(totalGateways).filter((g) => g.status == 'joined')
              .length,
            gateway,
          ).EAY,
        };
      });
      if (searchText && searchText.length > 0) {
        const filteredData = tableData.filter((data) => {
          return (
            data.label.toLowerCase().includes(searchText.toLowerCase()) ||
            data.gateway.settings.fqdn
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            data.gateway.gatewayAddress
              .toLowerCase()
              .includes(searchText.toLowerCase())
          );
        });
        setTableData(filteredData);
      } else {
        setTableData(tableData);
      }
    }
  }, [totalGateways, gateways, prototocolBalance, searchText]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('label', {
      id: 'label',
      header: 'Gateway',
      sortDescFirst: true,
      cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <div className="text-sm text-high">{row.original.label}</div>
          <div className="text-xs">
            {formatAddress(row.original.gateway.gatewayAddress)}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('rewardShareRatio', {
      id: 'rewardShareRatioe',
      header: 'Reward Share',
      sortDescFirst: true,
      cell: ({ row }) => formatPercentage(row.original.rewardShareRatio / 100),
    }),
    columnHelper.accessor('totalStake', {
      id: 'totalStake',
      header: 'Total Stake',
      sortDescFirst: true,
      cell: ({ row }) =>
        `${formatWithCommas(row.original.totalStake)} ${ticker}`,
    }),
    columnHelper.accessor('eay', {
      id: 'eay',
      header: () => (
        <div className="flex gap-1">
          EAY
          <Tooltip
            message={
              <div>
                <p>{EAY_TOOLTIP_TEXT}</p>
                <MathJax className="mt-4">{EAY_TOOLTIP_FORMULA}</MathJax>
              </div>
            }
          >
            <InfoIcon className="h-4" />
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
  ];

  return (
    <BaseModal onClose={onClose} showCloseButton={false} closeOnClickOutside>
      <div className="w-[48rem] overflow-hidden rounded-xl border border-grey-500 text-left">
        <div className="flex items-center rounded-t-xl border border-grey-500 px-6 py-2">
          <SearchIcon className="size-4 text-mid" />
          <input
            type="text"
            placeholder="Enter label, domain, or address"
            className="grow bg-transparent px-3 py-2 text-sm text-high placeholder:text-low focus:outline-none"
            value={searchText ?? ''}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <TableView
          columns={columns}
          data={tableData}
          onRowClick={(row) => {
            onGatewaySelected(row.gateway);
            onClose();
          }}
          defaultSortingState={{ id: 'label', desc: false }}
          isLoading={false}
          noDataFoundText="No gateways found."
          shortTable={true}
        />
      </div>
    </BaseModal>
  );
};

const GatewaySelector = ({
  selectedGateway,
  setSelectedGateway,
  gateways,
}: GatewaySelectorProps) => {
  const [showGatewaySelectorTable, setShowGatewaySelectorTable] =
    useState(false);

  return (
    <div className="flex items-center rounded border border-grey-500 p-2 pl-6 text-left text-sm text-mid">
      <div className="grow">
        {!gateways
          ? 'Loading Gateways...'
          : selectedGateway
            ? formatAddress(selectedGateway.gatewayAddress)
            : ''}
      </div>

      <div className={gateways ? undefined : 'pointer-events-none opacity-30'}>
        <Button
          buttonType={ButtonType.SECONDARY}
          className="max-h-7 text-mid"
          active={true}
          title="Choose Gateway"
          text="Choose Gateway"
          onClick={() => setShowGatewaySelectorTable(true)}
        />
      </div>
      {showGatewaySelectorTable && gateways && (
        <GatewaySelectorModal
          gateways={gateways}
          onClose={() => setShowGatewaySelectorTable(false)}
          onGatewaySelected={setSelectedGateway}
        />
      )}
    </div>
  );
};

export default GatewaySelector;
