import { GatewayWithAddress } from '@ar.io/sdk/web';
import {
  GATEWAY_STREAK_SORT_KEY,
  gatewayStreak,
} from '@src/utils/gatewayStreak';
import { useCallback } from 'react';
import { useGatewaysQuery } from './useGatewaysQuery';

interface UseAllGatewaysOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getNestedValue = (obj: Record<string, any>, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

const toSortableValue = (value: unknown): string | number | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  return undefined;
};

const compareValues = (
  valueA: string | number | undefined,
  valueB: string | number | undefined,
) => {
  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return 1;
  if (valueB == null) return -1;

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB;
  }

  return String(valueA).localeCompare(String(valueB));
};

const useAllGateways = (options: UseAllGatewaysOptions = {}) => {
  const { sortBy = 'totalDelegatedStake', sortOrder = 'desc' } = options;

  // Sorting happens here rather than in the query key. The rows were always
  // re-sorted client-side below, so passing sort through to the SDK only ever
  // fragmented the cache — every column click missed and triggered another
  // whole-program scan to reorder data the browser already had.
  const select = useCallback(
    (gateways: GatewayWithAddress[]) => {
      const sorted = [...gateways];

      sorted.sort((a, b) => {
        // `streak` and `totalStake` are computed, not stored, so neither
        // resolves as a path into the record.
        const sortValue = (gateway: GatewayWithAddress) => {
          if (sortBy === 'totalStake') {
            return gateway.totalDelegatedStake + gateway.operatorStake;
          }
          if (sortBy === GATEWAY_STREAK_SORT_KEY) {
            return gatewayStreak(gateway);
          }
          return toSortableValue(
            getNestedValue(gateway as Record<string, any>, sortBy),
          );
        };

        const valueA = sortValue(a);
        const valueB = sortValue(b);

        const comparison = compareValues(valueA, valueB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return sorted;
    },
    [sortBy, sortOrder],
  );

  return useGatewaysQuery(select);
};

export default useAllGateways;
