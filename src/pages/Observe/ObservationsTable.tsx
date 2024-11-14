import Bubble from '@src/components/Bubble';
import TableView from '@src/components/TableView';
import { db } from '@src/store/db';
import { Assessment } from '@src/types';
import { formatDateTime } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';

interface TableData {
  timestamp: Date;
  arnsNames: string;
  ownershipResult: boolean;
  arnsResult: boolean;
  overallResult: boolean;
  assessment: Assessment;
}

const columnHelper = createColumnHelper<TableData>();

const ObservationsTable = ({
  gatewayAddress,
  setSelectedAssessment,
}: {
  gatewayAddress: string;
  setSelectedAssessment: React.Dispatch<
    React.SetStateAction<Assessment | undefined>
  >;
}) => {
  const observations = useLiveQuery(async () => {
    return db.observations
      .where('gatewayAddress')
      .equals(gatewayAddress)
      .toArray();
  });

  const [tableData, setTableData] = useState<Array<TableData>>([]);

  useEffect(() => {
    if (observations) {
      const tableData: Array<TableData> = observations.map((observation) => {
        const assessment = observation.assessment;

        const arnsNames = Object.keys(
          assessment.arnsAssessments.chosenNames,
        ).join(', ');

        return {
          timestamp: new Date(observation.timestamp),
          arnsNames,
          ownershipResult: assessment.ownershipAssessment.pass,
          arnsResult: assessment.arnsAssessments.pass,
          overallResult: assessment.pass,
          assessment,
        };
      });
      setTableData(tableData);
    }
  }, [observations]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('timestamp', {
      id: 'timestamp',
      header: 'Timestamp',
      sortDescFirst: true,
      cell: ({ row }) => formatDateTime(new Date(row.original.timestamp)),
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
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={tableData || []}
        isLoading={false}
        noDataFoundText="No observations found."
        defaultSortingState={{ id: 'timestamp', desc: true }}
        onRowClick={(row) => {
          setSelectedAssessment(row.assessment);
        }}
      />
    </div>
  );
};

export default ObservationsTable;
