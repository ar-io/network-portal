/**
 * Compare two row values for a client-sorted table column.
 *
 * Missing values sort last in BOTH directions — a gateway with no performance
 * history is not the best performer, nor the worst — so the missing check runs
 * before the comparison and outranks `desc`.
 *
 * `negativeMeansMissing` is the subtle part. Some columns encode "no data" as
 * `-1` rather than `null` (they render as N/A), so a null check alone would
 * sort every N/A row to the very top in ascending order. Other columns use
 * negatives as real, ordered data — a gateway failing five epochs in a row IS
 * worse than one failing one — and must not be caught by the same rule. The
 * caller names which columns are which.
 */
export const compareRowValues = (
  left: unknown,
  right: unknown,
  { desc = false, negativeMeansMissing = false } = {},
): number => {
  const isMissing = (value: unknown) =>
    value == null ||
    (negativeMeansMissing && typeof value === 'number' && value < 0);

  const leftMissing = isMissing(left);
  const rightMissing = isMissing(right);
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;

  const comparison =
    typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right));

  return desc ? -comparison : comparison;
};
