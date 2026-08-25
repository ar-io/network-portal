import { RowData } from '@tanstack/react-table';
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<_TData extends RowData = any, _TValue = unknown> {
    displayName?: string;
    /**
     * Start hidden, but stay listed in the column selector.
     *
     * For a column that is genuinely useful and rarely needed — the width it
     * costs every reader outweighs the value to the few who want it, and
     * deleting it would take the capability away entirely.
     */
    defaultHidden?: boolean;
  }
}
