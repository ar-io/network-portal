import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useNetworkAnalysis from '@src/hooks/useNetworkAnalysis';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

/**
 * Where the network physically runs: hosting concentration, and how many
 * distinct networks and countries sit behind it.
 *
 * Aggregates only. The same analysis scores individual operators for
 * clustering, but that scoring is uncalibrated by the publisher's own account
 * and naming operators on that basis is a product decision, not a rendering
 * one.
 */
const DecentralizationPanel = () => {
  const { data: analysis, isLoading } = useNetworkAnalysis();

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-sm font-semibold text-mid">Infrastructure</h3>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5">
          <Placeholder className="h-6 w-24" />
          <Placeholder className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const infra = analysis?.infrastructure;
  const totals = analysis?.totals;
  if (!infra) return null;

  // The publisher zeroes this whole block when a run skips geolocation. Zero
  // distinct networks is not a finding about decentralisation, it is a
  // degraded run, and rendering it as "0 ASNs" would be alarming nonsense.
  const degraded = (infra.uniqueAsns ?? 0) === 0;

  const topProvider = infra.topProviders?.[0];
  const analysed = totals?.gatewaysAnalyzed;
  const inNetwork = totals?.gatewaysInNetwork;

  return (
    <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
      <div className="flex items-center gap-1 px-5 pb-3 pt-5">
        <h3 className="text-sm font-semibold text-mid">Infrastructure</h3>
        <Tooltip
          message={
            <div className="max-w-72">
              Resolved from DNS for gateways that are joined and publish an FQDN
              {analysed !== undefined && inNetwork !== undefined
                ? ` — ${formatWithCommas(analysed)} of ${formatWithCommas(inNetwork)} in the network.`
                : '.'}{' '}
              Refreshed daily.
            </div>
          }
        >
          <InfoIcon className="size-3 cursor-help text-low" />
        </Tooltip>
      </div>

      {degraded ? (
        <div className="px-5 pb-5 text-xs text-low">
          The most recent analysis run did not resolve infrastructure, so
          hosting and network distribution are unavailable.
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5 scrollbar scrollbar-thin">
          <div className="flex flex-col">
            <span className="text-xs text-low">Datacenter hosted</span>
            <span className="text-2xl font-semibold text-high">
              {infra.datacenterPercentage !== undefined
                ? `${infra.datacenterPercentage.toFixed(0)}%`
                : '—'}
            </span>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-xs text-low">Networks (ASNs)</span>
              <span className="text-base text-high">
                {formatWithCommas(infra.uniqueAsns ?? 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-low">Countries</span>
              <span className="text-base text-high">
                {formatWithCommas(infra.uniqueCountries ?? 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-low">Providers</span>
              <span className="text-base text-high">
                {formatWithCommas(infra.uniqueIsps ?? 0)}
              </span>
            </div>
          </div>

          {topProvider && (
            <div className="flex flex-col gap-1 border-t border-grey-500 pt-3">
              <span className="text-xs text-low">Largest provider</span>
              <div className="flex items-center justify-between text-xs">
                <span className="truncate pr-2 text-mid">
                  {topProvider.name}
                </span>
                <span className="whitespace-nowrap text-low">
                  {formatWithCommas(topProvider.count)} (
                  {topProvider.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-grey-700">
                <div
                  // Proportionate, not editorial: a provider holding a quarter
                  // of the analysed network is worth flagging, a small one is
                  // just a fact.
                  className={`h-full rounded ${
                    topProvider.percentage >= 25 ? 'bg-warning' : 'bg-mid'
                  }`}
                  style={{ width: `${Math.min(topProvider.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DecentralizationPanel;
