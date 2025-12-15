import { useColumnPreferences } from '@src/store/columnPreferences';
import {
  ColumnDef,
  ColumnSort,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import TableSkeletonRow from './TableSkeletonRow';
import { SortAsc, SortDesc } from './icons';

const ServerSortableTableView = <T, S>({
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
  onSortingChange,
  currentSorting,
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
  onSortingChange?: (sorting: SortingState) => void;
  currentSorting?: SortingState;
}) => {
  const [sorting, setSorting] = useState<SortingState>(
    currentSorting || [defaultSortingState],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { getTableColumnVisibility } = useColumnPreferences();

  // Update local sorting when currentSorting prop changes
  useEffect(() => {
    if (currentSorting) {
      setSorting(currentSorting);
    }
  }, [currentSorting]);

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

  const handleSortingChange = (updaterOrValue: any) => {
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);
    onSortingChange?.(newSorting);
  };

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    // Disable client-side sorting since we're doing server-side
    enableSorting: false,
    state: {
      sorting,
      ...(tableId ? { columnVisibility } : {}),
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const maxHeightRemClass = shortTable ? `max-h-[16rem]` : undefined;

  return (
    <div className={`overflow-x-auto scrollbar ${maxHeightRemClass}`}>
      <table className="w-full table-auto border-x border-b border-grey-500">
        <thead className="sticky top-0 z-10 bg-containerL0 text-xs text-low">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortState = header.column.getIsSorted();
                const canSort = header.column.columnDef.enableSorting !== false;

                return (
                  <th key={header.id} className="py-2 pl-6">
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        className="flex items-center gap-1 text-left"
                        onClick={() => {
                          const isDesc = sortState === 'desc';
                          const isAsc = sortState === 'asc';
                          let nextSort: 'asc' | 'desc' | false = false;

                          if (!isAsc && !isDesc) {
                            // No sort -> asc/desc based on column preference
                            nextSort = header.column.columnDef.sortDescFirst
                              ? 'desc'
                              : 'asc';
                          } else if (isAsc) {
                            // asc -> desc
                            nextSort = 'desc';
                          } else if (isDesc) {
                            // desc -> asc
                            nextSort = 'asc';
                          }

                          if (nextSort) {
                            handleSortingChange([
                              {
                                id: header.id,
                                desc: nextSort === 'desc',
                              },
                            ]);
                          }
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
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="overflow-y-auto text-sm">
          {isLoading ? (
            // Show skeleton rows when loading
            Array.from({ length: loadingRows }, (_, index) => (
              <TableSkeletonRow
                key={index}
                columns={
                  table.getAllColumns().filter((col) => col.getIsVisible())
                    .length
                }
              />
            ))
          ) : isError ? (
            // Show error message
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-sm text-mid"
              >
                {errorText}
              </td>
            </tr>
          ) : data.length === 0 ? (
            // Show no data message
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-sm text-mid"
              >
                {noDataFoundText}
              </td>
            </tr>
          ) : (
            // Show actual data rows when not loading
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
              })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServerSortableTableView;
