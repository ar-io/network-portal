import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import useAllGateways from '@src/hooks/useAllGateways';
import useWalletRewards from '@src/hooks/useWalletRewards';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

const SERIES = '#E19EE5';
const GATEWAYS_SHOWN = 5;

const formatArio = (value: number): string =>
  value >= 1000
    ? formatWithCommas(Math.round(value))
    : value.toFixed(value >= 1 ? 2 : 4);

const formatPercent = (rate: number): string => `${(rate * 100).toFixed(2)}%`;

/**
 * What the connected wallet has actually earned, and what that works out to.
 *
 * Two figures with very different standing sit here, and the design keeps them
 * apart. Earnings are measured — decoded from the program's own reward events —
 * and can be stated flatly. The yield is an extrapolation over a short history
 * whose denominator is *today's* stake, so anyone who has added or withdrawn
 * since is measured against a base that did not earn those rewards. On live
 * mainnet the median position reads 29.6% against a true network aggregate of
 * 5.0%, which is why the network figure sits beside it rather than being left
 * for the reader to find.
 */
const MyRewardsPanel = () => {
  const { summary, networkReturn, isLoading } = useWalletRewards();
  const { data: gateways } = useAllGateways();
  const ticker = useGlobalState((state) => state.ticker);

  const labelFor = useMemo(() => {
    const byAddress = new Map<string, string>();
    for (const g of gateways ?? []) {
      if (g.gatewayAddress) {
        byAddress.set(g.gatewayAddress, g.settings?.fqdn ?? g.gatewayAddress);
      }
    }
    return (address?: string) =>
      (address && byAddress.get(address)) ??
      (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Unknown');
  }, [gateways]);

  const chartData = useMemo(
    () =>
      summary?.perEpoch.map((p) => ({
        epochIndex: p.epochIndex,
        // A gap stays a gap: Recharts skips undefined, which is what a missing
        // epoch is. Zero-filling would draw an epoch that earned nothing.
        ario: p.ario ?? undefined,
      })),
    [summary],
  );

  // Additive: a wallet with no positions, or an endpoint without the document,
  // gets nothing rather than an empty chart claiming zero earnings.
  if (!isLoading && !summary) return null;

  if (!summary || !chartData) {
    return (
      <div className="rounded-xl border border-grey-600 p-6">
        <div className="h-4 w-32 animate-pulse rounded bg-grey-700" />
      </div>
    );
  }

  const earnedInWindow = summary.perEpoch.some((p) => p.ario !== null);
  const shown = summary.positions.slice(0, GATEWAYS_SHOWN);
  const remaining = summary.positions.length - shown.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="rounded-md border border-grey-500 bg-containerL0 px-3 py-2 text-xs">
        <div className="mb-1 text-mid">Epoch {p.epochIndex}</div>
        <div className="text-high">
          {formatArio(p.ario ?? 0)} {ticker}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-grey-600 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-high">Your Rewards</span>
          <Tooltip
            message={
              <div className="max-w-80">
                Rewards actually paid to your delegations, decoded from the
                program&apos;s own reward events — these are measured, not
                estimated.
                <br />
                <br />
                The yield beside them is not. It divides everything you have
                earned by the stake you hold <em>today</em>, so if you have
                added or withdrawn since, it is measured against a balance that
                did not earn those rewards. Compare it to the network figure
                rather than reading it as a rate to expect.
              </div>
            }
          >
            <InfoIcon className="size-3.5 shrink-0 text-low" />
          </Tooltip>
        </div>
        <span className="text-xs text-low">
          measured over {summary.epochsRecorded} epoch
          {summary.epochsRecorded === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="flex shrink-0 flex-col gap-5 lg:w-56">
          <div>
            <div className="text-xs text-low">Earned</div>
            <div className="text-2xl font-semibold text-high">
              {formatArio(summary.earned)}{' '}
              <span className="text-sm font-normal text-mid">{ticker}</span>
            </div>
            <div className="text-xs text-low">
              across {summary.positions.length} gateway
              {summary.positions.length === 1 ? '' : 's'}
            </div>
          </div>

          <div>
            <div className="text-xs text-low">Yield on current stake</div>
            <div className="text-2xl font-semibold text-high">
              {summary.annualisedReturn !== undefined
                ? formatPercent(summary.annualisedReturn)
                : '—'}
            </div>
            <div className="text-xs text-low">
              {summary.annualisedReturn === undefined
                ? 'no stake to measure against'
                : networkReturn !== undefined
                  ? `network ${formatPercent(networkReturn)}`
                  : 'annualised'}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 grow flex-col">
          {earnedInWindow ? (
            <div className="h-40 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff33"
                    vertical={false}
                  />
                  <XAxis dataKey="epochIndex" tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v: number) =>
                      v >= 1000
                        ? `${Math.round(v / 1000)}K`
                        : `${Math.round(v)}`
                    }
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: '#ffffff0a' }}
                  />
                  <Bar dataKey="ario" fill={SERIES} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            // Real lifetime earnings with an empty window means the rewards
            // predate what is retained — not that nothing was earned.
            <div className="flex h-40 items-center text-sm text-low">
              No rewards in the last {summary.perEpoch.length} epochs.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-transparent-100-8 pt-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs text-low">By gateway</span>
          <Tooltip
            message={
              <div className="max-w-72">
                Gateways choose what share of their rewards to pass to delegates
                — anywhere from 0% to 95% — so the same stake earns very
                differently depending on where it sits.
              </div>
            }
          >
            <InfoIcon className="size-3 shrink-0 text-low" />
          </Tooltip>
        </div>
        <dl className="flex flex-col gap-2">
          {shown.map((position) => (
            <div
              key={`${position.kind}-${position.gatewayAddress}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <dt className="min-w-0 truncate text-mid">
                {labelFor(position.gatewayAddress)}
                {position.basis === 'inferred' && (
                  <span className="ml-2 text-low">estimated</span>
                )}
              </dt>
              <dd className="flex shrink-0 items-center gap-4 tabular-nums">
                <span className="text-high">
                  {formatArio(position.earned)} {ticker}
                </span>
                <span className="w-16 text-right text-low">
                  {position.annualisedReturn !== undefined
                    ? formatPercent(position.annualisedReturn)
                    : 'exited'}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        {remaining > 0 && (
          <div className="mt-2 text-xs text-low">
            and {remaining} more gateway{remaining === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRewardsPanel;
