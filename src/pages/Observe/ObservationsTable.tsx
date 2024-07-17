import Bubble from '@src/components/Bubble';
import TableView from '@src/components/TableView';
import { observationsDB } from '@src/store/observationsDB';
import { formatDate } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';

interface TableData {
  timestamp: Date;
  arnsNames: string;
  ownershipResult: boolean;
  arnsResult: boolean;
  overallResult: boolean;
}

const columnHelper = createColumnHelper<TableData>();

const ObservationsTable = ({ gatewayAddress }: { gatewayAddress: string }) => {
  const observations = useLiveQuery(async () => {
    return observationsDB.observations
      .where('gatewayAddress')
      .equals(gatewayAddress)
      .toArray();
  });

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  useEffect(() => {
    if (observations) {
      const tableData: Array<TableData> = observations.map(
        (observation) => {

          const assessment = observation.assessment;

          const arnsNames = Object.keys(assessment.arnsAssessments.chosenNames).join(', ');

          return {
            timestamp: new Date(observation.timestamp), 
            arnsNames, 
            ownershipResult: assessment.ownershipAssessment.pass,
            arnsResult: assessment.arnsAssessments.pass,
            overallResult: assessment.pass,
          };
        },
      );
      setTableData(tableData);
    }
  }, [observations]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('timestamp', {
      id: 'timestamp',
      header: 'Timestamp',
      sortDescFirst: true,
      cell: ({ row }) => formatDate(new Date(row.original.timestamp)),
    }),
    columnHelper.accessor('arnsNames', {
      id: 'arnsNames',
      header: 'ArNS Names',
      sortDescFirst: false,
    }),
    columnHelper.accessor('ownershipResult', {
      id: 'ownershipResult',
      header: 'Ownership Result',
      sortDescFirst: false,
      cell: ({ row }) => <Bubble value={row.original.ownershipResult} />,
    }),
    columnHelper.accessor('arnsResult', {
      id: 'arnsResult',
      header: 'ArNS Result',
      sortDescFirst: false,
      cell: ({ row }) => <Bubble value={row.original.arnsResult} />,
    }),
    columnHelper.accessor('overallResult', {
      id: 'overallResult',
      header: 'Overall Result',
      sortDescFirst: false,
      cell: ({ row }) => <Bubble value={row.original.overallResult} />,
    }),
  ];

  return (
    <div>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[15px] pl-[24px] pr-[13px]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={tableData || []}
        isLoading={false}
        noDataFoundText="No observations found."
        defaultSortingState={{ id: 'timestamp', desc: true }}
      />
    </div>
  );
};

export default ObservationsTable;
