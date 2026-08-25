import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import useAnalyzerFindings from '@src/hooks/useAnalyzerFindings';
import { formatWithCommas } from '@src/utils';
import { useMemo } from 'react';

/**
 * Severity is ordinal and reserved, not categorical: two of the four steps are
 * deliberately neutral so `low` and `info` recede behind the two that need
 * acting on. Validated against the card surface for adjacent-pair separation
 * and 3:1 contrast; the categorical chroma-floor rule does not apply, since
 * giving the neutrals a hue would make them read as their own categories.
 */
const SEVERITY_COLOR: Record<string, string> = {
  high: '#DB4354',
  medium: '#FFB938',
  low: '#A3A3AD',
  info: '#63636D',
};

/**
 * One measure, so one hue: bar length carries the count and the colour carries
 * nothing. Matches the dashboard's distribution ramp, which is an inline hex
 * for the same reason — the design tokens have no accent entry.
 */
const KIND_BAR_COLOR = '#E19EE5';

/** A severity name this build has no colour for still gets a segment. */
const FALLBACK_SEVERITY_COLOR = '#63636D';

/** Worst first, everywhere this document is rendered. */
const SEVERITY_ORDER = ['high', 'medium', 'low', 'info'] as const;

const KIND_LABELS: Record<string, string> = {
  shared_report_tx: 'Shared report transaction',
  shared_base_domain: 'Shared base domain',
  shared_ip: 'Shared IP address',
  shared_asn: 'Shared hosting provider',
  near_identical_results: 'Near-identical results',
  analyzer_cluster_overlap: 'Cluster overlap',
  composite_independence_risk: 'Composite independence risk',
  divergent_assessment: 'Divergent assessment',
  unmatched_observer: 'Unmatched observer',
};

/** Unknown kinds are the publisher adding a detector, not an error. */
const labelForKind = (kind: string): string =>
  KIND_LABELS[kind] ??
  kind.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/**
 * The independence detectors' output across the whole published window.
 *
 * The per-epoch list already lives under the observers table; this is the
 * shape of the window — how much is being flagged, how serious, and what
 * kinds dominate — which no single epoch shows.
 *
 * The detector reports itself as uncalibrated, which is stated on the card
 * rather than in a tooltip: a reader who takes these as verdicts has
 * misread them, and that has to be unmissable rather than discoverable.
 */
const IndependenceFindings = () => {
  const { data } = useAnalyzerFindings();

  const summary = useMemo(() => {
    const counts = data?.counts;
    if (!counts?.total) return undefined;

    const bySeverity = counts.bySeverity ?? {};
    // Rank by count and keep the publisher's own severity names, so a step this
    // build has no colour for still appears rather than being silently dropped.
    const severities = SEVERITY_ORDER.filter(
      (name) => (bySeverity[name] ?? 0) > 0,
    ).map((name) => ({ name, count: bySeverity[name] ?? 0 }));
    const extraSeverities = Object.entries(bySeverity)
      .filter(
        ([name, count]) => count > 0 && !SEVERITY_ORDER.includes(name as never),
      )
      .map(([name, count]) => ({ name, count }));

    const segments = [...severities, ...extraSeverities];
    const segmentTotal = segments.reduce((sum, s) => sum + s.count, 0);

    const kinds = Object.entries(counts.byKind ?? {})
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    const largestKind = kinds[0]?.[1] ?? 0;

    return {
      total: counts.total,
      segments,
      segmentTotal,
      kinds,
      largestKind,
    };
  }, [data]);

  if (!summary) return null;

  const { epochRange } = data ?? {};
  const epochLabel =
    epochRange?.from !== undefined && epochRange?.to !== undefined
      ? `epochs ${epochRange.from}–${epochRange.to}`
      : undefined;

  return (
    <div className="rounded-xl border border-transparent-100-8 bg-containerL0 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-high">Independence Findings</span>
          <Tooltip
            message={
              <div className="max-w-80">
                Correlations the analyzer detected between observers — shared
                report transactions, shared infrastructure, near-identical
                results. Observers are meant to assess the network
                independently, so overlap between them is worth knowing about.
                These describe what the data shows, not who did what.
              </div>
            }
          >
            <InfoIcon className="size-3.5 shrink-0 text-low" />
          </Tooltip>
        </div>
        <div className="text-xs text-low">
          {formatWithCommas(summary.total)} findings
          {epochLabel ? ` · ${epochLabel}` : ''}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex h-2.5 w-full gap-0.5" aria-hidden="true">
          {summary.segments.map(({ name, count }) => (
            <div
              key={name}
              className="rounded-full"
              style={{
                width: `${(count / summary.segmentTotal) * 100}%`,
                backgroundColor:
                  SEVERITY_COLOR[name] ?? FALLBACK_SEVERITY_COLOR,
              }}
            />
          ))}
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-2">
          {summary.segments.map(({ name, count }) => (
            <div key={name} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    SEVERITY_COLOR[name] ?? FALLBACK_SEVERITY_COLOR,
                }}
              />
              <dt className="text-xs capitalize text-low">{name}</dt>
              <dd className="text-xs text-mid">{formatWithCommas(count)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 border-t border-transparent-100-8 pt-5 sm:grid-cols-2 xl:grid-cols-3">
        {summary.kinds.map(([kind, count]) => (
          <div key={kind} className="flex items-center gap-3">
            <dt className="w-44 shrink-0 truncate text-xs text-low">
              {labelForKind(kind)}
            </dt>
            <div className="h-1.5 min-w-8 grow rounded-full bg-grey-700">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(count / summary.largestKind) * 100}%`,
                  backgroundColor: KIND_BAR_COLOR,
                }}
              />
            </div>
            <dd className="w-7 shrink-0 text-right text-xs tabular-nums text-mid">
              {formatWithCommas(count)}
            </dd>
          </div>
        ))}
      </dl>

      {data?.calibrated === false && (
        <div className="mt-5 border-t border-transparent-100-8 pt-3 text-xs text-low">
          The detector reports its similarity scoring as uncalibrated
          {typeof data.thresholdSimilarity === 'number'
            ? ` (threshold ${data.thresholdSimilarity})`
            : ''}
          . Treat these as leads to check, not conclusions.
        </div>
      )}
    </div>
  );
};

export default IndependenceFindings;
