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
  noDataFoundText="No data found.",
  onRowClick,
}: {
  columns: ColumnDef<T, S>[];
  data: T[];
  defaultSortingState: ColumnSort;
  isLoading: boolean;
  noDataFoundText?: string;
  onRowClick?: (row: T) => void;
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


  return (
    <>
      <table className="w-full border-x border-b border-grey-500">
        <thead className="text-xs text-low">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortState = header.column.getIsSorted();
                return (
                  <th key={header.id} className="py-[7.5px] pl-[24px]">
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
                        <div className="w-[16px]" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="text-sm">
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={`border-t border-grey-500 text-low *:py-[16px] *:pl-[24px] ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLoading && (
        <div className="flex items-center justify-center border-x border-b border-grey-500 px-[24px] py-[16px] text-low">
          <Placeholder className="w-full" />
        </div>
      )}
      {!isLoading && table.getRowCount() === 0 && (
        <div className="flex h-[100px] items-center justify-center border-x border-b border-grey-500 text-low">
          {noDataFoundText} 
        </div>
      )}
    </>
  );
};

export default TableView;
