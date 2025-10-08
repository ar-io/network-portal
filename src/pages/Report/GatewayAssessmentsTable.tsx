import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import AssessmentDetailsPanel from '@src/components/AssessmentDetailsPanel';
import Bubble from '@src/components/Bubble';
import ColumnSelector from '@src/components/ColumnSelector';
import TableView from '@src/components/TableView';
import { CheckSquareIcon } from '@src/components/icons';
import { Assessment, ReportData } from '@src/types';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface TableData {
  observedHost: string;
  expectedOwner: string;
  observedOwner?: string;
  ownershipResult: boolean;

  arnsResult: boolean;

  overallResult: boolean;
  hasOffsetAssessments: boolean;
  assessment: Assessment;
}

const columnHelper = createColumnHelper<TableData>();

const GatewayAssessmentsTable = ({
  gateway,
  reportData,
}: {
  gateway?: AoGatewayWithAddress | null;
  reportData: ReportData;
}) => {
  const [observedHost, setObservedHost] = useState<string>();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment>();

  const tableData = useMemo<Array<TableData>>(() => {
    return Object.entries(reportData.gatewayAssessments).map(
      ([observedHost, assessment]) => ({
        observedHost,
        expectedOwner:
          assessment.ownershipAssessment.expectedWallets.join(', '),
        observedOwner: assessment.ownershipAssessment.observedWallet,
        ownershipResult: assessment.ownershipAssessment.pass,
        arnsResult: assessment.arnsAssessments.pass,
        overallResult: assessment.pass,
        hasOffsetAssessments: assessment.offsetAssessments != null,
        assessment,
      }),
    );
  }, [reportData]);

  const columns = useMemo<ColumnDef<TableData, any>[]>(
    () => [
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
        cell: ({ row }) => (
          <div className="pr-6">
            <Bubble value={row.original.overallResult} />
          </div>
        ),
      }),
      columnHelper.accessor('hasOffsetAssessments', {
        id: 'offsetAssessments',
        header: 'Offset Assessments',
        sortDescFirst: true,
        enableSorting: true,
        cell: ({ getValue }) =>
          getValue() ? (
            <div className="flex justify-center">
              <CheckSquareIcon className="size-5" />
            </div>
          ) : (
            <div className="h-5" />
          ),
      }),
    ],
    [],
  );

  return (
    <div className="mb-6">
      <div className="flex w-full items-center rounded-t-xl border border-grey-600 bg-containerL3 py-[0.9375rem] pl-6 pr-[0.8125rem]">
        <div className="grow text-sm text-mid">Reports</div>
        <ColumnSelector tableId="gateway-assessments" columns={columns} />
      </div>
      <TableView
        columns={columns}
        data={tableData || []}
        isLoading={false}
        noDataFoundText="No reports found."
        defaultSortingState={{ id: 'observedHost', desc: false }}
        onRowClick={(row) => {
          setObservedHost(row.observedHost);
          setSelectedAssessment(row.assessment);
        }}
        tableId="gateway-assessments"
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
