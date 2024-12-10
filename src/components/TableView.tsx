import {
  ColumnDef,
  ColumnSort,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
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
}: {
  columns: ColumnDef<T, S>[];
  data: T[];
  defaultSortingState: ColumnSort;
  isLoading: boolean;
  noDataFoundText?: string;
  onRowClick?: (row: T) => void;
  shortTable?: boolean;
}) => {
  const [sorting, setSorting] = useState<SortingState>([defaultSortingState]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    state: { sorting },
    onSortingChange: setSorting,
  });

  const maxHeightRemClass = shortTable 
    ? `max-h-[16rem]`
    : undefined;

  console.log(maxHeightRemClass);

  return (
    <>
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
                    {row.getAllCells().map((cell) => (
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
      </div>
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
    </>
  );
};

export default TableView;
