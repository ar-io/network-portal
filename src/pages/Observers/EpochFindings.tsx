import Tooltip from '@src/components/Tooltip';
import type { AnalyzerFinding } from '@src/utils/analyzerApi';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

const INITIALLY_SHOWN = 4;

/** Worst first, so the list opens on what matters. */
const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3,
};

const SEVERITY_CLASS: Record<string, string> = {
  high: 'border-text-red/[.56] bg-text-red/[.1] text-text-red',
  medium: 'border-warning/[.56] bg-warning/[.1] text-warning',
  low: 'border-grey-500 bg-grey-700 text-mid',
  info: 'border-grey-500 bg-grey-700 text-low',
};

/**
 * Detector output for the selected epoch, from the published archive.
 *
 * The epoch document already carries these and the portal was downloading and
 * discarding them, so this is presentation over data already in hand — no
 * extra request.
 *
 * Summaries are the publisher's own wording, which states what the data shows
 * rather than what it means. That distinction is load-bearing: the publisher
 * reports its similarity threshold as uncalibrated and caps confidence
 * accordingly, so these are leads, not verdicts, and are presented as such.
 */
const EpochFindings = ({ findings }: { findings?: AnalyzerFinding[] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!findings?.length) return null;

  const sorted = [...findings].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity ?? 'info'] ?? 9) -
      (SEVERITY_ORDER[b.severity ?? 'info'] ?? 9),
  );
  const shown = expanded ? sorted : sorted.slice(0, INITIALLY_SHOWN);
  const hidden = sorted.length - shown.length;

  return (
    <div className="mt-6 w-full rounded-xl border border-grey-600 text-sm">
      <div className="flex items-center gap-2 rounded-t-xl border-b border-grey-600 bg-containerL3 px-6 py-2">
        <span className="text-mid">
          Observations for this epoch ({sorted.length})
        </span>
        <Tooltip
          message={
            <div className="max-w-72">
              Correlations the analyzer detected between observers this epoch —
              shared report transactions, shared infrastructure, near-identical
              results. These describe what the data shows. The publisher reports
              its similarity scoring as uncalibrated, so treat them as leads to
              check rather than conclusions.
            </div>
          }
        >
          <InfoIcon className="size-3 cursor-help text-low" />
        </Tooltip>
      </div>

      <div className="flex flex-col">
        {shown.map((finding, index) => {
          const severity = finding.severity ?? 'info';
          return (
            <div
              key={finding.id ?? `${finding.kind}-${index}`}
              className="flex items-start gap-3 border-b border-grey-600 px-6 py-3 last:border-b-0"
            >
              <span
                className={`mt-px shrink-0 rounded-xl border px-2 py-0.5 text-xs capitalize ${
                  SEVERITY_CLASS[severity] ?? SEVERITY_CLASS.info
                }`}
              >
                {severity}
              </span>
              <div className="flex min-w-0 grow flex-col gap-0.5">
                <span className="text-xs text-mid">{finding.summary}</span>
                {finding.kind && (
                  <span className="font-mono text-[0.625rem] text-low">
                    {finding.kind}
                    {typeof finding.confidence === 'number' &&
                      ` · confidence ${finding.confidence.toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(hidden > 0 || expanded) && (
        <button
          className="w-full rounded-b-xl border-t border-grey-600 py-2 text-xs text-low hover:text-mid"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
        </button>
      )}
    </div>
  );
};

export default EpochFindings;
