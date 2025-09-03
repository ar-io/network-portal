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
import Placeholder from './Placeholder';
import { SortAsc, SortDesc } from './icons';

const TableView = <T, S>({
  columns,
  data,
  defaultSortingState,
  isLoading,
  noDataFoundText = 'No data found.',
  onRowClick,
  shortTable = false,
  tableId,
  showColumnSelector = false,
}: {
  columns: ColumnDef<T, S>[];
  data: T[];
  defaultSortingState: ColumnSort;
  isLoading: boolean;
  noDataFoundText?: string;
  onRowClick?: (row: T) => void;
  shortTable?: boolean;
  tableId?: string;
  showColumnSelector?: boolean;
}) => {
  const [sorting, setSorting] = useState<SortingState>([defaultSortingState]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { getTableColumnVisibility } = useColumnPreferences();

  // Initialize column visibility from store
  useEffect(() => {
    if (tableId && showColumnSelector) {
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
    }
  }, [tableId, showColumnSelector, columns, getTableColumnVisibility]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      ...(showColumnSelector && tableId ? { columnVisibility } : {}),
    },
    onSortingChange: setSorting,
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
                              : header.column.columnDef.sortDescFirst ?? true,
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
        {!isLoading && (
          <tbody className="overflow-y-auto text-sm">
            {table.getRowModel().rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  className={`border-t border-grey-500 text-low *:py-4 *:pl-6 ${onRowClick ? 'cursor-pointer' : ''}`}
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
        )}
      </table>
      {isLoading && (
        <div className="flex items-center justify-center border-x border-b border-grey-500 px-6 py-4 text-low">
          <Placeholder className="w-full" />
        </div>
      )}
      {!isLoading && table.getRowCount() === 0 && (
        <div className="flex h-[6.25rem] items-center justify-center border-x border-b border-grey-500 text-low">
          {noDataFoundText}
        </div>
      )}
    </div>
  );
};

export default TableView;
