import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useNetworkAnalysis from '@src/hooks/useNetworkAnalysis';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

/** Anything below this share of reporting gateways is grouped into "Other". */
const MIN_SHARE_TO_LIST = 1;

/**
 * Release-version spread across gateways that report one.
 *
 * Rendered from the daily analysis, so it is absent whenever the endpoint is
 * unset or the run skipped performance probes. The panel removes itself in
 * that case rather than showing an empty chart — it is additive, and a dead
 * box on the dashboard is worse than no box.
 */
const GatewayVersionPanel = () => {
  const { data: analysis, isLoading } = useNetworkAnalysis();

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-sm font-semibold text-mid">Gateway Releases</h3>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5">
          <Placeholder className="h-6 w-24" />
          <Placeholder className="h-4 w-full" />
          <Placeholder className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const versions = analysis?.versions;
  const distribution = versions?.distribution;
  if (!versions || !distribution?.length) return null;

  const listed = distribution.filter((v) => v.percentage >= MIN_SHARE_TO_LIST);
  const otherCount = distribution
    .filter((v) => v.percentage < MIN_SHARE_TO_LIST)
    .reduce((sum, v) => sum + v.count, 0);

  const totalReporting = versions.totalReporting ?? 0;
  const totalGateways = versions.totalGateways ?? 0;
  // Gateways that resolved but reported no version are not "on an old
  // release" — they are unmeasured, and lumping them in would overstate
  // fragmentation.
  const notReporting = Math.max(totalGateways - totalReporting, 0);

  return (
    <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
      <div className="flex items-center gap-1 px-5 pb-3 pt-5">
        <h3 className="text-sm font-semibold text-mid">Gateway Releases</h3>
        <Tooltip
          message={
            <div className="max-w-64">
              Release versions reported by analysed gateways. Only gateways that
              are joined and publish an FQDN are probed, and not all of those
              report a version.
            </div>
          }
        >
          <InfoIcon className="size-3 cursor-help text-low" />
        </Tooltip>
      </div>

      <div className="flex items-baseline gap-2 px-5">
        <span className="text-2xl font-semibold text-high">
          {versions.topVersionPercentage !== undefined
            ? `${versions.topVersionPercentage.toFixed(0)}%`
            : '—'}
        </span>
        <span className="text-xs text-low">
          on{' '}
          {versions.topVersion ? `v${versions.topVersion}` : 'the top release'}
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 pb-2 scrollbar scrollbar-thin">
        {listed.map((entry) => (
          <div key={entry.version} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-mid">v{entry.version}</span>
              <span className="text-low">
                {formatWithCommas(entry.count)} ({entry.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-grey-700">
              <div
                className="h-full rounded bg-streak-up"
                style={{ width: `${Math.min(entry.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}

        {otherCount > 0 && (
          <div className="flex items-center justify-between text-xs text-low">
            <span>Other releases</span>
            <span>{formatWithCommas(otherCount)}</span>
          </div>
        )}
      </div>

      {/* Pinned below the scroll region: a count of what is NOT measured is
          context for everything above it, so it should not scroll out of view
          or land half-clipped at the panel edge. */}
      {notReporting > 0 && (
        <div className="mx-5 flex shrink-0 items-center justify-between border-t border-grey-500 py-3 text-xs text-low">
          <span>No version reported</span>
          <span>{formatWithCommas(notReporting)}</span>
        </div>
      )}
    </div>
  );
};

export default GatewayVersionPanel;
