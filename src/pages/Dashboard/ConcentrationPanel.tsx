import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import useNetworkAnalysis from '@src/hooks/useNetworkAnalysis';
import { formatWithCommas } from '@src/utils';
import { InfoIcon } from 'lucide-react';

/**
 * How concentrated the network is, in gateways and in rewards.
 *
 * A full-width band rather than a fourth square panel: the row above holds
 * three h-72 cards and a fourth would wrap onto a line of its own. These are
 * four scalars, so they read better spread across the width than stacked.
 *
 * The two shares are deliberately shown together. Clustered gateways being 77%
 * of the fleet and receiving 77% of rewards is a different — and far less
 * alarming — claim than either number alone, and presenting only the reward
 * figure would imply an advantage the data does not show.
 */
const ConcentrationPanel = () => {
  const { data: analysis, isLoading } = useNetworkAnalysis();

  if (isLoading) {
    return (
      <div className="col-span-1 flex w-full flex-col gap-3 rounded-xl border border-grey-500 px-5 py-4 md:col-span-6">
        <Placeholder className="h-4 w-40" />
        <Placeholder className="h-6 w-full" />
      </div>
    );
  }

  const economics = analysis?.economics;
  const totals = analysis?.totals;
  const clustered = totals?.clustered;
  const analysed = totals?.gatewaysAnalyzed;

  // Nothing to say without at least one of the two halves.
  if (!economics && (clustered === undefined || analysed === undefined)) {
    return null;
  }

  const clusteredShare =
    clustered !== undefined && analysed
      ? (clustered / analysed) * 100
      : undefined;
  const rewardShare = economics?.topCentralizedPercentage;

  const mARIOToDisplay = (value?: number) =>
    value === undefined ? undefined : Math.round(value / 1_000_000);

  const distributed = mARIOToDisplay(economics?.totalDistributedRewards);
  const perGateway = mARIOToDisplay(economics?.rewardPerGateway);

  // Shown only when both halves exist, since the point is the comparison.
  const proportional =
    clusteredShare !== undefined &&
    rewardShare !== undefined &&
    Math.abs(clusteredShare - rewardShare) < 5;

  return (
    <div className="col-span-1 flex w-full flex-col rounded-xl border border-grey-500 md:col-span-6">
      <div className="flex items-center gap-1 px-5 pb-2 pt-4">
        <h3 className="text-sm font-semibold text-mid">Concentration</h3>
        <Tooltip
          message={
            <div className="max-w-80">
              A cluster is a group of gateways that resolve to shared
              infrastructure — the same IP, network or base domain. That is
              evidence of shared hosting, not proof of a single operator.
              Rewards are attributed to a cluster by summing its members&apos;.
              Covers analysed gateways only: those joined and publishing an
              FQDN.
            </div>
          }
        >
          <InfoIcon className="size-3 cursor-help text-low" />
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 pb-4 md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-low">Gateways in a cluster</span>
          <span className="text-2xl font-semibold text-high">
            {clusteredShare !== undefined
              ? `${clusteredShare.toFixed(0)}%`
              : '—'}
          </span>
          {clustered !== undefined && analysed !== undefined && (
            <span className="text-xs text-low">
              {formatWithCommas(clustered)} of {formatWithCommas(analysed)}
              {' analysed'}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-low">Rewards to those clusters</span>
          <span
            className={`text-2xl font-semibold ${
              rewardShare !== undefined && !proportional
                ? 'text-warning'
                : 'text-high'
            }`}
          >
            {rewardShare !== undefined ? `${rewardShare.toFixed(0)}%` : '—'}
          </span>
          <span className="text-xs text-low">
            {proportional
              ? 'in line with their share of gateways'
              : rewardShare !== undefined
                ? 'out of step with their share of gateways'
                : 'not yet published'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-low">Rewards distributed</span>
          <span className="text-2xl font-semibold text-high">
            {distributed !== undefined ? formatWithCommas(distributed) : '—'}
          </span>
          <span className="text-xs text-low">ARIO</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-low">Average per gateway</span>
          <span className="text-2xl font-semibold text-high">
            {perGateway !== undefined ? formatWithCommas(perGateway) : '—'}
          </span>
          <span className="text-xs text-low">ARIO</span>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationPanel;
