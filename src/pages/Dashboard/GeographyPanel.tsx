import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useNetworkAnalysis from '@src/hooks/useNetworkAnalysis';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

/** Countries listed individually before the tail is grouped. */
const MAX_COUNTRIES_LISTED = 6;

/**
 * Where analysed gateways resolve to, by country.
 *
 * Reads the same document as the other two analysis panels, so React Query
 * serves all three from one request.
 *
 * Bars are deliberately unshaded. A single hosting provider holding a third of
 * the network is a concentration signal; a country holding the same share is
 * not the same claim — a country contains many independent providers, and
 * colouring it as a warning would assert something this data does not show.
 */
const GeographyPanel = () => {
  const { data: analysis, isLoading } = useNetworkAnalysis();

  if (isLoading) {
    return (
      <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
        <div className="px-5 pb-3 pt-5">
          <h3 className="text-sm font-semibold text-mid">Geography</h3>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5">
          <Placeholder className="h-4 w-full" />
          <Placeholder className="h-4 w-full" />
          <Placeholder className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const infra = analysis?.infrastructure;
  const distribution = infra?.countryDistribution;

  // Zeroed the same way the rest of the infrastructure block is when a run
  // skips geolocation, so an empty list here means "not measured", never
  // "nowhere".
  if (!infra || !distribution?.length) return null;

  const listed = distribution.slice(0, MAX_COUNTRIES_LISTED);
  const tail = distribution.slice(MAX_COUNTRIES_LISTED);
  const tailCount = tail.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="flex h-72 w-full flex-col rounded-xl border border-grey-500">
      <div className="flex items-center gap-1 px-5 pb-3 pt-5">
        <h3 className="text-sm font-semibold text-mid">Geography</h3>
        <Tooltip
          message={
            <div className="max-w-64">
              Countries the analysed gateways resolve to, from the daily run.
              Covers gateways that are joined and publish an FQDN, not the whole
              registry.
            </div>
          }
        >
          <InfoIcon className="size-3 cursor-help text-low" />
        </Tooltip>
        <div className="grow" />
        <span className="text-xs text-low">
          {formatWithCommas(infra.uniqueCountries ?? distribution.length)}{' '}
          countries
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 pb-2 scrollbar scrollbar-thin">
        {listed.map((entry) => (
          <div
            key={entry.countryCode || entry.country}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                {entry.countryCode && (
                  // Rendered as a code rather than a flag emoji: flag glyphs
                  // fall back to bare letters on Windows, so the code is what
                  // everyone actually sees.
                  <span className="rounded bg-grey-700 px-1 py-px font-mono text-[0.625rem] text-low">
                    {entry.countryCode}
                  </span>
                )}
                <span className="truncate text-mid">{entry.country}</span>
              </span>
              <span className="whitespace-nowrap pl-2 text-low">
                {formatWithCommas(entry.count)} ({entry.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded bg-grey-700">
              <div
                className="h-full rounded bg-mid"
                style={{ width: `${Math.min(entry.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Outside the scroll region on purpose. Inside it, this row lands
          half-clipped at the panel edge, which reads as a rendering fault
          rather than as content that scrolls. */}
      {tailCount > 0 && (
        <div className="mx-5 flex shrink-0 items-center justify-between border-t border-grey-500 py-3 text-xs text-low">
          <span>
            {tail.length} more {tail.length === 1 ? 'country' : 'countries'}
          </span>
          <span>{formatWithCommas(tailCount)}</span>
        </div>
      )}
    </div>
  );
};

export default GeographyPanel;
