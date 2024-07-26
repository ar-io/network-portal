import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import AssessmentDetailsPanel from '@src/components/AssessmentDetailsPanel';
import Bubble from '@src/components/Bubble';
import TableView from '@src/components/TableView';
import { Assessment, ReportData } from '@src/types';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

interface TableData {
  observedHost: string;
  expectedOwner: string;
  observedOwner?: string;
  ownershipResult: boolean;

  arnsResult: boolean;

  overallResult: boolean;
  assessment: Assessment;
}

const columnHelper = createColumnHelper<TableData>();

const GatewayAssessmentsTable = ({
  gateway,
  reportData,
}: {
  gateway?: AoGatewayWithAddress;
  reportData: ReportData;
}) => {
  const [tableData, setTableData] = useState<Array<TableData>>([]);

  const [observedHost, setObservedHost] = useState<string>(); 
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment>();

  useEffect(() => {
    const tableData: Array<TableData> = Object.entries(
      reportData.gatewayAssessments,
    ).map(([observedHost, assessment]) => {
      return {
        observedHost: observedHost,
        expectedOwner: assessment.ownershipAssessment.expectedWallets.join(),
        observedOwner: assessment.ownershipAssessment.observedWallet,
        ownershipResult: assessment.ownershipAssessment.pass,
        arnsResult: assessment.arnsAssessments.pass,
        overallResult: assessment.pass,
        assessment: assessment,
      };
    });
    setTableData(tableData);
  }, [reportData]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    columnHelper.accessor('observedHost', {
      id: 'observedHost',
      header: 'Observed Host',
      sortDescFirst: false,
    }),
    columnHelper.accessor('expectedOwner', {
      id: 'expectedOwner',
      header: 'Expected Owner',
      sortDescFirst: false,
      cell: ({ row }) => {
        const expectedWallet = row.original.expectedOwner;
        return expectedWallet ? <AddressCell address={expectedWallet} /> : '';
      },
    }),
    columnHelper.accessor('observedOwner', {
      id: 'observedOwner',
      header: 'Observed Owner',
      sortDescFirst: false,
      cell: ({ row }) => {
        const observedWallet = row.original.observedOwner;
        return observedWallet ? <AddressCell address={observedWallet} /> : '';
      },
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
    <div className='mb-6'>
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Reports</div>
      </div>
      <TableView
        columns={columns}
        data={tableData || []}
        isLoading={false}
        noDataFoundText="No reports found."
        defaultSortingState={{ id: 'timestamp', desc: true }}
        onRowClick={(row) => {
          setObservedHost(row.observedHost);
          setSelectedAssessment(row.assessment)
        }}
      />
      {selectedAssessment && gateway && (
        <AssessmentDetailsPanel
          observedHost={observedHost}
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(undefined)}
        />
      )}
    </div>
  );
};

export default GatewayAssessmentsTable;
