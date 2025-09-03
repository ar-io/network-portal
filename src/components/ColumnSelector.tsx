import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useColumnPreferences } from '@src/store/columnPreferences';
import { ColumnDef } from '@tanstack/react-table';
import { FilterIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';

export interface ColumnSelectorProps<T> {
  tableId: string;
  columns: ColumnDef<T, any>[];
  onColumnVisibilityChange?: (
    columnVisibility: Record<string, boolean>,
  ) => void;
}

const ColumnSelector = <T,>({
  tableId,
  columns,
  onColumnVisibilityChange,
}: ColumnSelectorProps<T>) => {
  const { getTableColumnVisibility, setColumnVisibility } =
    useColumnPreferences();

  // Get current visibility state
  const currentVisibility = getTableColumnVisibility(tableId);

  // Extract column metadata for display
  const columnMetadata = useMemo(() => {
    return columns
      .filter((col) => col.id && col.id !== 'action' && col.id !== 'actions') // Exclude action columns
      .map((col) => {
        // Use meta.displayName if available
        if (col.meta?.displayName) {
          return {
            id: col.id!,
            label: col.meta.displayName,
            visible: currentVisibility[col.id!] ?? true,
          };
        }

        const header = col.header;
        let label = col.id || 'Unknown';

        // Extract label from header if it's a string or function
        if (typeof header === 'string') {
          label = header;
        } else if (typeof header === 'function') {
          // For function headers, use the column id as fallback
          label = col.id || 'Unknown';
        }

        return {
          id: col.id!,
          label,
          visible: currentVisibility[col.id!] ?? true,
        };
      });
  }, [columns, currentVisibility]);

  const handleColumnToggle = useCallback(
    (columnId: string, visible: boolean) => {
      setColumnVisibility(tableId, columnId, visible);

      // Notify parent component of visibility change
      if (onColumnVisibilityChange) {
        const updatedVisibility = {
          ...currentVisibility,
          [columnId]: visible,
        };
        onColumnVisibilityChange(updatedVisibility);
      }
    },
    [tableId, currentVisibility, setColumnVisibility, onColumnVisibilityChange],
  );

  const visibleCount = columnMetadata.filter((col) => col.visible).length;
  const totalCount = columnMetadata.length;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center justify-center rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end p-px transition-opacity hover:opacity-80"
          title={`Column Selector (${visibleCount}/${totalCount} visible)`}
        >
          <div className="inline-flex size-full items-center justify-center rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end p-2 shadow-inner">
            <FilterIcon className="size-4" />
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-50 min-w-[200px] max-w-[250px] rounded border border-grey-500 bg-containerL0 text-sm shadow-lg"
        align="end"
        sideOffset={4}
      >
        <div className="border-b border-grey-500 px-3 py-2 text-xs font-medium text-mid">
          Columns ({visibleCount}/{totalCount})
        </div>

        <div className="max-h-[300px] overflow-y-auto scrollbar">
          {columnMetadata.map((column) => (
            <DropdownMenu.Item
              key={column.id}
              className="flex cursor-pointer select-none items-center gap-3 px-3 py-2 outline-none data-[highlighted]:bg-containerL3"
              onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
            >
              <input
                type="checkbox"
                id={`column-${column.id}`}
                checked={column.visible}
                onChange={(e) =>
                  handleColumnToggle(column.id, e.target.checked)
                }
                className="size-4 rounded border border-grey-500 bg-containerL0 text-high focus:ring-2 focus:ring-grey-400 focus:ring-offset-0"
              />
              <label
                htmlFor={`column-${column.id}`}
                className="flex-1 cursor-pointer text-sm text-high"
              >
                {column.label}
              </label>
            </DropdownMenu.Item>
          ))}
        </div>

        {columnMetadata.length === 0 && (
          <div className="px-3 py-4 text-center text-low">
            No columns available
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ColumnSelector;
