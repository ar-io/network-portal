import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import AddressCell from '@src/components/AddressCell';
import AssessmentDetailsPanel from '@src/components/AssessmentDetailsPanel';
import Bubble from '@src/components/Bubble';
import ColumnSelector from '@src/components/ColumnSelector';
import TableView from '@src/components/TableView';
import { Assessment, ReportData } from '@src/types';
import { formatWithCommas } from '@src/utils';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface TableData {
  observedHost: string;
  expectedOwner: string;
  observedOwner?: string;
  ownershipResult: boolean;
  arnsResult: boolean;
  overallResult: boolean;
  offsetAssessmentStatus: 'passed' | 'failed' | 'skipped';
  assessment: Assessment;
}

const columnHelper = createColumnHelper<TableData>();

const offsetStatusRank: Record<TableData['offsetAssessmentStatus'], number> = {
  passed: 0,
  failed: 1,
  skipped: 2,
};

const GatewayAssessmentsTable = ({
  gateway,
  reportData,
}: {
  gateway?: AoGatewayWithAddress | null;
  reportData: ReportData;
}) => {
  const [observedHost, setObservedHost] = useState<string>();

  const [selectedAssessment, setSelectedAssessment] = useState<Assessment>();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const tableData = useMemo<Array<TableData>>(() => {
    return Object.entries(reportData.gatewayAssessments).flatMap(
      ([observedHost, assessment]) =>
        assessment.ownershipAssessment.expectedWallets.map(
          (expectedWallet) => ({
            observedHost,
            expectedOwner: expectedWallet,
            observedOwner: assessment.ownershipAssessment.observedWallet,
            ownershipResult: assessment.ownershipAssessment.pass,
            arnsResult: assessment.arnsAssessments.pass,
            overallResult: assessment.pass,
            offsetAssessmentStatus: assessment.offsetAssessments
              ? assessment.offsetAssessments.pass
                ? 'passed'
                : 'failed'
              : 'skipped',
            assessment,
          }),
        ),
    );
  }, [reportData]);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!tableData || !debouncedSearchTerm) return tableData;
    const lowerSearch = debouncedSearchTerm.toLowerCase();
    return tableData.filter(
      (item) =>
        item.observedHost.toLowerCase().includes(lowerSearch) ||
        item.expectedOwner.toLowerCase().includes(lowerSearch) ||
        (item.observedOwner?.toLowerCase().includes(lowerSearch) ?? false),
    );
  }, [tableData, debouncedSearchTerm]);

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
      columnHelper.accessor('offsetAssessmentStatus', {
        id: 'offsetAssessments',
        header: 'Offset Assessments',
        sortDescFirst: false,
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) =>
          offsetStatusRank[
            rowA.getValue(columnId) as TableData['offsetAssessmentStatus']
          ] -
          offsetStatusRank[
            rowB.getValue(columnId) as TableData['offsetAssessmentStatus']
          ],
        cell: ({ getValue }) => {
          const status = getValue();

          if (status === 'skipped') {
            return (
              <div className="pr-6">
                <div className="flex w-fit items-center rounded-xl border border-grey-500 bg-grey-700/40 px-2 py-0.5 text-xs text-low">
                  Skipped
                </div>
              </div>
            );
          }

          return (
            <div className="pr-6">
              <Bubble
                value={status === 'passed'}
                additionalClasses="text-xs"
                customText={status === 'passed' ? 'Passed' : 'Failed'}
              />
            </div>
          );
        },
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
    ],
    [],
  );

  return (
    <div className="mb-6">
      <div className="flex w-full items-center justify-between overflow-x-auto rounded-t-xl border border-grey-600 bg-containerL3 py-2 pl-6 pr-[0.8125rem] text-sm">
        <div className="flex items-center gap-4">
          <div className="text-mid">
            Gateway Assessments{' '}
            {`(${formatWithCommas(filteredData.length)}${debouncedSearchTerm ? ` of ${formatWithCommas(tableData.length)}` : ''})`}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-low" />
            <input
              type="text"
              placeholder="Search by host or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px] rounded-md border border-grey-700 bg-grey-1000 py-1.5 pl-9 pr-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
            />
          </div>
        </div>
        <ColumnSelector tableId="gateway-assessments" columns={columns} />
      </div>
      <TableView
        columns={columns}
        data={filteredData}
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
