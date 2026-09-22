import type { YieldStatus } from '@src/hooks/useYieldStatus';
import { formatWithCommas } from '@src/utils';

/**
 * One EAY cell, shared by every table that shows one.
 *
 * Three tables used to render this themselves, and they drifted: a fix to how
 * an unknown yield sorts reached two of them and missed the third. Keeping the
 * rendering here, and the value's shape in `knownYield`, is what stops that
 * happening again.
 *
 * `eay` is a fraction (0.05 is 5%), or undefined when there is no yield to
 * show. Undefined renders as N/A once the epoch has loaded, and as a
 * placeholder while it is still loading, so an in-flight read never reads as
 * a missing value.
 */
export const YieldCell = ({
  eay,
  status,
}: {
  eay?: number;
  status: YieldStatus;
}) => {
  if (eay !== undefined) {
    return <div>{`${formatWithCommas(eay * 100)}%`}</div>;
  }
  if (status === 'loading') {
    // Sized to the column, not `Placeholder`'s 100px default, and written out
    // rather than overridden: two conflicting Tailwind classes resolve by
    // stylesheet order, not by which one came last in the string.
    return (
      <div className="h-3.5 w-12 animate-pulse rounded bg-transparent-100-16" />
    );
  }
  return <div>N/A</div>;
};

/**
 * Says once, above a table, why its yield column is empty.
 *
 * Renders nothing while loading or when yields are available, so it can never
 * flash a failure during a normal page load. Only a failed read or an epoch
 * still awaiting prescription gets a sentence, and they get different ones,
 * because "could not be read" is false for the second.
 */
export const YieldUnavailableNote = ({ status }: { status: YieldStatus }) => {
  if (status !== 'failed' && status !== 'pending') return null;

  return (
    <div className="border-x border-grey-600 bg-containerL3 px-6 py-2 text-xs text-low">
      {status === 'failed'
        ? 'Yield is unavailable because the current epoch could not be read. Every other column is live.'
        : 'Yield will appear once this epoch’s rewards are set on chain. Every other column is live.'}
    </div>
  );
};
