import { useColumnPreferences } from '@src/store/columnPreferences';
import {
  ColumnDef,
  ColumnSort,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import TableSkeletonRow from './TableSkeletonRow';
import { SortAsc, SortDesc } from './icons';

const TableView = <T, S>({
  columns,
  data,
  defaultSortingState,
  isLoading,
  isError = false,
  noDataFoundText = 'No data found.',
  errorText = 'Something went wrong. Please try again.',
  onRowClick,
  shortTable = false,
  tableId,
  loadingRows = 5,
}: {
  columns: ColumnDef<T, S>[];
  data: T[];
  defaultSortingState: ColumnSort;
  isLoading: boolean;
  isError?: boolean;
  noDataFoundText?: string;
  errorText?: string;
  onRowClick?: (row: T) => void;
  shortTable?: boolean;
  tableId?: string;
  loadingRows?: number;
}) => {
  const [sorting, setSorting] = useState<SortingState>([defaultSortingState]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { getTableColumnVisibility } = useColumnPreferences();

  // Initialize and subscribe to column visibility changes from store
  useEffect(() => {
    if (!tableId) return;

    const updateColumnVisibility = () => {
      const storedVisibility = getTableColumnVisibility(tableId);
      // Convert stored visibility to react-table format
      const reactTableVisibility: VisibilityState = {};
      columns.forEach((column) => {
        if (column.id) {
          // Default to visible (true) if not explicitly set to false
          reactTableVisibility[column.id] =
            storedVisibility[column.id] !== false;
        }
      });
      setColumnVisibility(reactTableVisibility);
    };

    // Initial load
    updateColumnVisibility();

    // Subscribe to changes for this specific table
    const unsubscribe = useColumnPreferences.subscribe(
      (state) => state.preferences[tableId],
      () => updateColumnVisibility(),
      { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    );

    return unsubscribe;
  }, [tableId, columns, getTableColumnVisibility]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      ...(tableId ? { columnVisibility } : {}),
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const maxHeightRemClass = shortTable ? `max-h-[16rem]` : undefined;

  return (
    <div
      className={`overflow-x-auto scrollbar scrollbar-thin ${maxHeightRemClass}`}
    >
      <table className="w-full table-auto border-x border-b border-grey-500">
        <thead className="sticky top-0 z-10 bg-containerL0 text-xs text-low">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortState = header.column.getIsSorted();
                return (
                  <th key={header.id} className="py-2 pl-6">
                    <button
                      className="flex items-center gap-1 text-left"
                      onClick={() => {
                        setSorting([
                          {
                            id: header.column.id,
                            desc: sortState
                              ? sortState === 'desc'
                                ? false
                                : true
                              : (header.column.columnDef.sortDescFirst ?? true),
                          },
                        ]);
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {sortState ? (
                        sortState === 'desc' ? (
                          <SortDesc />
                        ) : (
                          <SortAsc />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="overflow-y-auto text-sm">
          {isLoading
            ? // Show skeleton rows when loading
              Array.from({ length: loadingRows }, (_, index) => (
                <TableSkeletonRow
                  key={index}
                  columns={
                    table.getAllColumns().filter((col) => col.getIsVisible())
                      .length
                  }
                />
              ))
            : // Show actual data rows when not loading
              table
                .getRowModel()
                .rows.map((row) => {
                  return (
                    <tr
                      key={row.id}
                      className={`border-t border-grey-500 text-low *:py-4 *:pl-6 transition-all duration-200 ${onRowClick ? 'cursor-pointer hover:bg-gradient-to-r hover:from-transparent hover:via-[#E19EE505] hover:to-transparent' : ''}`}
                      onClick={
                        onRowClick ? () => onRowClick(row.original) : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
        </tbody>
      </table>
      {!isLoading && !isError && table.getRowCount() === 0 && (
        <div className="flex h-[6.25rem] items-center justify-center border-x border-b border-grey-500 text-low">
          {noDataFoundText}
        </div>
      )}
      {!isLoading && isError && (
        <div className="flex h-[6.25rem] items-center justify-center border-x border-b border-grey-500 text-low">
          {errorText}
        </div>
      )}
    </div>
  );
};

export default TableView;
