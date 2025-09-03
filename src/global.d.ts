declare const __NPM_PACKAGE_VERSION__: string;

import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<_TData extends RowData = any, _TValue = unknown> {
    displayName?: string;
  }
}
