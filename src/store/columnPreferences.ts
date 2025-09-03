import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

export interface ColumnPreference {
  id: string;
  label: string;
  visible: boolean;
}

export interface TableColumnPreferences {
  [tableId: string]: {
    [columnId: string]: boolean;
  };
}

interface ColumnPreferencesState {
  preferences: TableColumnPreferences;
  setColumnVisibility: (
    tableId: string,
    columnId: string,
    visible: boolean,
  ) => void;
  getColumnVisibility: (tableId: string, columnId: string) => boolean;
  setTableColumnVisibility: (
    tableId: string,
    columnVisibility: Record<string, boolean>,
  ) => void;
  getTableColumnVisibility: (tableId: string) => Record<string, boolean>;
  resetTableColumns: (tableId: string) => void;
}

export const useColumnPreferences = create<ColumnPreferencesState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        preferences: {},

        setColumnVisibility: (
          tableId: string,
          columnId: string,
          visible: boolean,
        ) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              [tableId]: {
                ...state.preferences[tableId],
                [columnId]: visible,
              },
            },
          }));
        },

        getColumnVisibility: (tableId: string, columnId: string) => {
          const { preferences } = get();
          return preferences[tableId]?.[columnId] ?? true; // Default to visible
        },

        setTableColumnVisibility: (
          tableId: string,
          columnVisibility: Record<string, boolean>,
        ) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              [tableId]: columnVisibility,
            },
          }));
        },

        getTableColumnVisibility: (tableId: string) => {
          const { preferences } = get();
          return preferences[tableId] ?? {};
        },

        resetTableColumns: (tableId: string) => {
          set((state) => {
            const newPreferences = { ...state.preferences };
            delete newPreferences[tableId];
            return { preferences: newPreferences };
          });
        },
      }),
      {
        name: 'column-preferences',
      },
    ),
  ),
);
