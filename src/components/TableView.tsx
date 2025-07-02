import useIsMobile from '@src/hooks/useIsMobile';
import {
  ColumnDef,
  ColumnSort,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type HeaderContext,
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
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  const maxHeightRemClass = shortTable ? `max-h-[16rem]` : undefined;

  const rows = table.getRowModel().rows;
  const pageCount = Math.ceil(rows.length / 10);
  const pagedRows = isMobile ? rows.slice(page * 10, page * 10 + 10) : rows;

  return (
    <>
      {!isMobile && (
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
                                  : header.column.columnDef.sortDescFirst ??
                                    true,
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
                {pagedRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-t border-grey-500 text-low *:py-4 *:pl-6${
                      onRowClick ? ' cursor-pointer' : ''
                    }`}
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
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}
      {isMobile && !isLoading && (
        <div className="space-y-4">
          {pagedRows.map((row) => (
            <div
              key={row.id}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`rounded-lg border border-grey-500 p-4 text-sm text-low${
                onRowClick ? ' cursor-pointer' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onRowClick(row.original);
                      }
                    }
                  : undefined
              }
            >
              {row.getAllCells().map((cell) => (
                <div key={cell.id} className="mb-1 flex justify-between gap-2">
                  <div className="text-xs text-low">
                    {flexRender(
                      cell.column.columnDef.header,
                      cell.getContext() as unknown as HeaderContext<T, S>,
                    )}
                  </div>
                  <div className="text-right">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-4 pt-2">
            <button
              disabled={page === 0}
              className="text-xs disabled:opacity-50"
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="text-xs text-low">
              {page + 1} / {pageCount || 1}
            </span>
            <button
              disabled={page >= pageCount - 1}
              className="text-xs disabled:opacity-50"
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
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
