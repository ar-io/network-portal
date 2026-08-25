import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import type { ProtocolParameter } from '@src/hooks/useProtocolParameters';

/**
 * The protocol's limits as a label/value grid.
 *
 * One component for all three places these appear — the gateway join card, the
 * staking connect card, and the standalone card shown once a wallet is
 * connected — because the whole point is that they never disagree. The column
 * count is the caller's, since the three sit in containers of different widths.
 */
const ProtocolParameterGrid = ({
  parameters,
  columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
}: {
  parameters: ProtocolParameter[] | undefined;
  columns?: string;
}) => {
  if (!parameters) {
    return (
      <div className={`grid ${columns} gap-x-6 gap-y-4`}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="h-2.5 w-20 animate-pulse rounded bg-grey-700" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-grey-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <dl className={`grid ${columns} gap-x-6 gap-y-4`}>
      {parameters.map(({ label, value, tooltip }) => (
        <div key={label} className="flex min-w-0 flex-col gap-1">
          <dt className="flex items-center gap-1 text-xs leading-none text-low">
            <span className="truncate">{label}</span>
            <Tooltip message={tooltip}>
              <InfoIcon className="size-3.5 shrink-0 text-low" />
            </Tooltip>
          </dt>
          <dd className="text-sm text-high">{value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default ProtocolParameterGrid;
