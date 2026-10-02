import { mARIOToken } from '@ar.io/sdk/web';
import PanelUnavailable from '@src/components/PanelUnavailable';
import Placeholder from '@src/components/Placeholder';
import UnitToggle from '@src/components/UnitToggle';
import useEpochPrices from '@src/hooks/useEpochPrices';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useEpochsWithCount from '@src/hooks/useEpochsWithCount';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { latestPricedEpoch, resolveEpochPrice } from '@src/utils/epochPrice';
import {
  type RewardUnit,
  formatRewardAmount,
  formatRewardTick,
} from '@src/utils/rewardsFormat';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Props } from 'recharts/types/cartesian/Bar';

import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

/**
 * Legend swatches, one per stacked series.
 *
 * The bars are filled with gradients at 0.125-0.3 opacity, which is legible
 * across a 40px-wide bar and invisible in an 8px dot, so each swatch is the
 * gradient's own stops at full strength rather than a copy of the fill. Two
 * stacked series with no key could only be told apart by hovering, while the
 * supply donut on the same dashboard has always had one.
 */
const REWARD_SERIES = [
  {
    label: 'Gateway rewards',
    swatch: 'linear-gradient(135deg, #F7C3A1, #DF9BE8)',
  },
  { label: 'Observer rewards', swatch: '#3DB7C2' },
  {
    label: 'Gateway, not paid',
    swatch: 'rgba(223, 155, 232, 0.12)',
    outline: 'rgba(223, 155, 232, 0.6)',
  },
  {
    label: 'Observer, not paid',
    swatch: 'rgba(61, 183, 194, 0.12)',
    outline: 'rgba(61, 183, 194, 0.6)',
  },
] as const;

const EPOCH_COUNT = 7; // Contract retains ~7 epochs on-chain

interface RewardsData {
  epoch: number;
  /** Undefined when the epoch has no published price and USD is selected. */
  gatewayRewards?: number;
  observerRewards?: number;
  /** Whether a USD figure could be produced for this epoch at all. */
  priced: boolean;
  /**
   * Set when the figure uses the latest close rather than this epoch's own,
   * which only happens for the epoch still running.
   */
  pricedFromEpoch?: number;
  /**
   * Whether `prescribe_epoch` has split this epoch's pool. Before it has, the
   * total is known and the gateway/observer split is not, so the epoch draws no
   * bar and the tooltip gives the total alone.
   */
  split: boolean;
  /**
   * Why there is no split, when there is none. `pending` is the routine case,
   * an epoch not yet prescribed; `unavailable` is a prescribed epoch whose
   * split cannot be derived because no observers were selected.
   */
  splitReason?: 'pending' | 'unavailable' | 'skipped';
  /** The whole pool, in the selected unit; undefined when unpriced in USD. */
  total?: number;
  /** `total`, but only for an unsplit epoch: drawn as an outlined bar. */
  pendingTotal?: number;
  /**
   * Reward the epoch did not pay out, gateway and observer together, taken
   * OUT of those segments rather than added to them. Undefined when not
   * knowable, which must not render as zero.
   */
  rewardsForfeited?: number;
  /** The gateway half of `rewardsForfeited`, for the tooltip. */
  forfeitedGateway?: number;
  /** The observer half of `rewardsForfeited`, for the tooltip. */
  forfeitedObserver?: number;
  status: 'Distributed' | 'Pending' | 'Not paid';
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
  ticker,
}: TooltipProps<ValueType, NameType> & {
  unit?: RewardUnit;
  ticker?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as RewardsData;

    // An epoch the analyzer has not priced yet carries no USD figure at all;
    // the bars are absent, and the tooltip must not imply a zero.
    if (unit === 'usd' && !data.priced) {
      return (
        <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
          <p>{`Epoch ${label} (${data.status})`}</p>
          <p className="text-low">Not priced yet</p>
        </div>
      );
    }

    // Shares its formatter with the axis so the two cannot disagree — showing
    // converted figures under an ARIO label was the bug this replaces.
    const money = (value: number) =>
      formatRewardAmount(value, unit ?? 'ario', ticker);

    if (!data.split) {
      return (
        <div className="max-w-60 rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
          <p>{`Epoch ${label} (${data.status})`}</p>
          {data.total !== undefined && (
            <p>{`Total eligible: ${money(data.total)}`}</p>
          )}
          {data.pricedFromEpoch !== undefined && (
            <p className="text-low">
              {`Valued at epoch ${data.pricedFromEpoch}'s close — this epoch has not closed yet.`}
            </p>
          )}
          <p className="text-low">
            {data.splitReason === 'skipped'
              ? 'No observations were submitted for this epoch, so it paid nothing and the rewards stayed in the treasury. The figure above is what it would have paid.'
              : data.splitReason === 'unavailable'
                ? 'This epoch had no observers selected, so its gateway share cannot be shown.'
                : 'How this splits between gateways and observers is set on chain after the epoch starts.'}
          </p>
        </div>
      );
    }

    const gateway = data.gatewayRewards ?? 0;
    const observer = data.observerRewards ?? 0;
    // `gatewayRewards` is the share that was actually paid; the forfeited
    // slice was taken out of it. The total must add it back, or it would
    // report less than the bar's own height.
    const forfeited = data.rewardsForfeited ?? 0;
    const lostGateway = data.forfeitedGateway ?? 0;
    const lostObserver = data.forfeitedObserver ?? 0;

    return (
      <div className="rounded border border-grey-500 bg-containerL0 px-4 py-2 text-mid">
        <p>{`Epoch ${label} (${data.status})`}</p>
        <p>{`Gateway Rewards: ${money(gateway)}`}</p>
        <p>{`Observer Rewards: ${money(observer)}`}</p>
        {forfeited > 0 && (
          <p className="text-low">{`Not paid out: ${money(forfeited)}`}</p>
        )}
        <p>{`Total eligible: ${money(gateway + observer + forfeited)}`}</p>
        {forfeited > 0 && (
          <p className="max-w-60 text-low">
            {[
              lostGateway > 0
                ? `${money(lostGateway)} to gateways that failed the epoch`
                : undefined,
              lostObserver > 0
                ? `${money(lostObserver)} to observers that did not submit`
                : undefined,
            ]
              .filter(Boolean)
              .join(', ')}
            . Neither is paid; it stays in the treasury.
          </p>
        )}
        {data.pricedFromEpoch !== undefined && (
          <p className="max-w-60 text-low">
            {`Valued at epoch ${data.pricedFromEpoch}'s close — this epoch has not closed yet.`}
          </p>
        )}
      </div>
    );
  }

  return null;
};

/**
 * The slice of the gateway pool the protocol kept because the gateways
 * entitled to it failed the epoch.
 *
 * Drawn in the same neutral and the same `4 3` dash as {@link PendingBar},
 * because it says the same kind of thing — tokens the chart's bar accounts
 * for that never left the treasury. It is a segment of the stack rather than
 * a marker above it: the bar's height is the eligible pool, and this came out
 * of that pool, not in addition to it.
 */
const ForfeitedBar = (tint: string) => {
  const renderFunc = ({ x, y, width, height }: Props) =>
    height ? (
      <rect
        x={Number(x) + 0.5}
        y={Number(y) + 0.5}
        width={Math.max(0, Number(width) - 1)}
        height={Math.max(0, Number(height) - 1)}
        fill={`rgba(${tint}, 0.12)`}
        stroke={`rgba(${tint}, 0.6)`}
        // Dotted, where `PendingBar` is dashed: both mean "counted but not
        // paid", and the two must not be mistaken for each other on a chart
        // that can show both at once.
        strokeDasharray="2 2"
      />
    ) : (
      <></>
    );
  return renderFunc;
};

/**
 * Each unpaid slice carries its own pot's colour, so a glance says not just
 * how much went unpaid but which half it came from. Flat tints rather than
 * the gradients: a gradient at 12% opacity reads as a smudge.
 */
const GATEWAY_TINT = '223, 155, 232'; // the pink end of the gateway gradient
const OBSERVER_TINT = '61, 183, 194'; // #3DB7C2, the observer teal

/**
 * An epoch whose total is known but whose split is not: an outline at the
 * total's height. An empty slot read as zero rewards, or as missing data, and
 * the tooltip that explains it cannot be hovered on a phone.
 */
const PendingBar = ({ x, y, width, height }: Props) =>
  height ? (
    <rect
      x={Number(x) + 0.5}
      y={Number(y) + 0.5}
      width={Math.max(0, Number(width) - 1)}
      height={Math.max(0, Number(height) - 1)}
      fill="rgba(202, 202, 214, 0.04)"
      stroke="rgba(202, 202, 214, 0.45)"
      strokeDasharray="4 3"
    />
  ) : (
    <></>
  );

const CustomBar = (borderHeight: number, borderColor: string) => {
  const renderFunc = ({ fill, x, y, width, height }: Props) => {
    const barBorderColor = 'rgba(202, 202, 214, 0.32)';
    return height ? (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          stroke="none"
          fill={fill}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={borderHeight}
          stroke="none"
          fill={borderColor}
        />
        <rect x={x} y={y} width={1} height={height} fill={barBorderColor} />
        <rect
          x={Number(x) + Number(width) - 1}
          y={y}
          width={1}
          height={height}
          fill={barBorderColor}
        />
      </g>
    ) : (
      <></>
    );
  };
  return renderFunc;
};

const _CustomUnclaimedBar = ({
  fill,
  x,
  y,
  width,
  height,
  strokeDasharray: strokeDashArray,
  stroke,
}: Props) => {
  return strokeDashArray ? (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height ? height - 1 : 0}
        fill={fill}
      />
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={Number(y) + Number(height)}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
      <line
        x1={x}
        y1={y}
        x2={Number(x) + Number(width)}
        y2={y}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
      <line
        x1={Number(x) + Number(width)}
        y1={y}
        x2={Number(x) + Number(width)}
        y2={Number(y) + Number(height)}
        stroke={stroke}
        strokeDasharray={strokeDashArray}
      />
    </g>
  ) : (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={stroke}
        fill={fill}
      />
    </g>
  );
};

const RewardsDistributionPanel = () => {
  const ticker = useGlobalState((state) => state.ticker);
  const [unit, setUnit] = useState<RewardUnit>('ario');
  const prices = useEpochPrices();
  const latest = useMemo(() => latestPricedEpoch(prices), [prices]);

  const [focusBar, setFocusBar] = useState<number>();
  const [mouseLeave, setMouseLeave] = useState(true);
  const { data: epochs } = useEpochsWithCount(EPOCH_COUNT);
  const epochLoadFailed = useGlobalState((state) => state.epochLoadFailed);
  const { data: epochSettings } = useEpochSettings();
  const currentEpochIndex = useGlobalState(
    (state) => state.currentEpoch?.epochIndex,
  );

  const rewardsData = useMemo(() => {
    return epochs
      ?.filter((epoch) => epoch !== undefined)
      .sort((a, b) => a!.epochIndex - b!.epochIndex)
      .map((epoch) => {
        const gatewayRewards = new mARIOToken(
          epoch!.distributions.totalEligibleGatewayReward,
        )
          .toARIO()
          .valueOf();
        const observerRewards = new mARIOToken(
          epoch!.distributions.totalEligibleObserverReward,
        )
          .toARIO()
          .valueOf();

        const totalRewards = new mARIOToken(
          epoch!.distributions.totalEligibleRewards,
        )
          .toARIO()
          .valueOf();

        // The share of the gateway pool the protocol retained because the
        // gateways entitled to it failed the epoch. Undefined where it is not
        // knowable, which must not collapse to zero — see
        // `forfeitedGatewayReward`.
        const toArio = (v: number | undefined) =>
          v === undefined ? undefined : new mARIOToken(v).toARIO().valueOf();

        // Both halves are forfeitable and for different reasons: a gateway
        // loses its share by failing the epoch, a prescribed observer by
        // never submitting. They are summed into one band — the question the
        // bar answers is how much went unpaid, not which pot it came from —
        // and the tooltip separates them.
        const forfeitedGateway = toArio(epoch!.forfeitedGatewayReward);
        const forfeitedObserver = toArio(epoch!.forfeitedObserverReward);
        const forfeited =
          forfeitedGateway === undefined && forfeitedObserver === undefined
            ? undefined
            : (forfeitedGateway ?? 0) + (forfeitedObserver ?? 0);

        // Each epoch is valued at its own close. Converting a total at
        // today's price is a different figure — about 16% apart over the
        // current window — and would move history whenever the price moved.
        const resolved = resolveEpochPrice({
          ownPrice: prices.get(epoch!.epochIndex),
          epochIndex: epoch!.epochIndex,
          currentEpochIndex,
          latest,
        });
        const price = resolved.price;
        const inUsd = unit === 'usd';
        const inUnit = (ario: number) =>
          inUsd ? (price === undefined ? undefined : ario * price) : ario;

        // Absent (SDK fallback path) means the source carried no such flag,
        // so trust its totals as before; only an explicit false withholds the
        // split.
        // A skipped epoch's split IS known — nothing was paid — but it must
        // not draw the stacked bar, because the pool it was prescribed never
        // left the treasury. Checked first for that reason.
        const skipped = epoch!.rewardsSkipped === true;
        const split = !skipped && epoch!.rewardsSplitKnown !== false;
        const splitReason = skipped
          ? ('skipped' as const)
          : split
            ? undefined
            : epoch!.rewardsPrescribed === false
              ? ('pending' as const)
              : ('unavailable' as const);

        return {
          epoch: epoch!.epochIndex,
          // An epoch the analyzer has not priced yet, or that has not been
          // split yet, draws no bar rather than a zero one. The epoch in
          // progress is routinely in both states.
          // Split out of the gateway segment rather than added on top: the
          // stack must still total the eligible pool, and what was forfeited
          // came out of that pool, not in addition to it.
          gatewayRewards: split
            ? inUnit(Math.max(0, gatewayRewards - (forfeitedGateway ?? 0)))
            : undefined,
          observerRewards: split
            ? inUnit(Math.max(0, observerRewards - (forfeitedObserver ?? 0)))
            : undefined,
          rewardsForfeited:
            split && forfeited !== undefined && forfeited > 0
              ? inUnit(forfeited)
              : undefined,
          forfeitedGateway:
            split && forfeitedGateway ? inUnit(forfeitedGateway) : undefined,
          forfeitedObserver:
            split && forfeitedObserver ? inUnit(forfeitedObserver) : undefined,
          split,
          splitReason,
          total: inUnit(totalRewards),
          pendingTotal: split ? undefined : inUnit(totalRewards),
          priced: price !== undefined,
          ...(resolved.basis === 'latest'
            ? { pricedFromEpoch: resolved.fromEpoch }
            : {}),
          status: (skipped
            ? 'Not paid'
            : epoch!.epochIndex === currentEpochIndex
              ? 'Pending'
              : 'Distributed') as RewardsData['status'],
        };
      });
  }, [epochs, currentEpochIndex, prices, latest, unit]);

  const hasPending =
    rewardsData?.some((d) => d.splitReason === 'pending') ?? false;
  const hasUnavailable =
    rewardsData?.some((d) => d.splitReason === 'unavailable') ?? false;
  const hasSkipped =
    rewardsData?.some((d) => d.splitReason === 'skipped') ?? false;

  // Offer the switch only when there is something to switch to.
  const pricedCount = rewardsData?.filter((d) => d.priced).length ?? 0;
  const unpricedCount = (rewardsData?.length ?? 0) - pricedCount;

  return (
    <div className="rounded-xl border border-grey-500">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-3 pt-5">
        <span className="text-sm text-mid">Rewards by Epoch</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-low">Last {EPOCH_COUNT} Epochs</span>
          {pricedCount > 0 && (
            <UnitToggle
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'ario', label: ticker || 'ARIO' },
                { value: 'usd', label: 'USD' },
              ]}
            />
          )}
        </div>
      </div>
      <div className="relative h-56">
        {rewardsData && rewardsData.length > 0 ? (
          <div className="size-full text-xs text-low">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rewardsData}
                margin={{ top: 20, right: 16, left: 8, bottom: 10 }}
                onMouseMove={(state) => {
                  if (
                    state.isTooltipActive &&
                    state.activeTooltipIndex !== undefined
                  ) {
                    setFocusBar(state.activeTooltipIndex);
                    setMouseLeave(false);
                  } else {
                    setFocusBar(undefined);
                    setMouseLeave(true);
                  }
                }}
                onMouseLeave={() => {
                  setMouseLeave(true);
                }}
                barCategoryGap={'20%'}
              >
                <defs>
                  <linearGradient
                    id="gatewayRewardGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.25} />
                    <stop
                      offset="100%"
                      stopColor="#DF9BE8"
                      stopOpacity={0.125}
                    />
                  </linearGradient>
                  <linearGradient
                    id="gatewayRewardHover"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F7C3A1" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#DF9BE8" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient
                    id="observerRewardGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3DB7C2" stopOpacity={0.3} />
                    <stop
                      offset="100%"
                      stopColor="#3DB7C2"
                      stopOpacity={0.15}
                    />
                  </linearGradient>
                  <linearGradient
                    id="observerRewardHover"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3DB7C2" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#3DB7C2" stopOpacity={0.5} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="epoch" />
                <YAxis
                  width={unit === 'usd' ? 56 : 48}
                  tickFormatter={(v) => formatRewardTick(v, unit)}
                />
                <Tooltip
                  content={<CustomTooltip unit={unit} ticker={ticker} />}
                  cursor={false}
                />

                <Bar
                  dataKey="gatewayRewards"
                  name="Gateway Rewards"
                  stackId="rewards"
                  fill="url(#gatewayRewardGradient)"
                  stroke="rgba(202, 202, 214, 0.32)"
                  shape={CustomBar(0, 'transparent')}
                >
                  {rewardsData.map((_entry, index) => (
                    <Cell
                      key={`gw-${index}`}
                      fill={
                        index !== focusBar || mouseLeave
                          ? 'url(#gatewayRewardGradient)'
                          : 'url(#gatewayRewardHover)'
                      }
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="observerRewards"
                  name="Observer Rewards"
                  stackId="rewards"
                  fill="url(#observerRewardGradient)"
                  stroke="rgba(202, 202, 214, 0.32)"
                  shape={CustomBar(1, 'white')}
                >
                  {rewardsData.map((_entry, index) => (
                    <Cell
                      key={`obs-${index}`}
                      fill={
                        index !== focusBar || mouseLeave
                          ? 'url(#observerRewardGradient)'
                          : 'url(#observerRewardHover)'
                      }
                    />
                  ))}
                </Bar>
                {/* Last in the stack, so it caps the bar. Reading a bar from
                    the bottom up is paid-then-unpaid, and the unpaid part
                    meets the axis line at the pool's full height. */}
                <Bar
                  dataKey="forfeitedGateway"
                  name="Gateway, not paid"
                  stackId="rewards"
                  shape={ForfeitedBar(GATEWAY_TINT)}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="forfeitedObserver"
                  name="Observer, not paid"
                  stackId="rewards"
                  shape={ForfeitedBar(OBSERVER_TINT)}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="pendingTotal"
                  name="Split pending"
                  stackId="rewards"
                  shape={PendingBar}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : epochSettings && !epochSettings.hasEpochZeroStarted ? (
          <div className="flex size-full">
            <div className="m-auto h-4 text-sm italic text-low">
              Awaiting first epoch...
            </div>
          </div>
        ) : epochLoadFailed ? (
          <PanelUnavailable>
            Rewards history is unavailable because the current epoch could not
            be read.
          </PanelUnavailable>
        ) : (
          <div className="flex size-full">
            <Placeholder className="m-auto h-4" />
          </div>
        )}
      </div>
      {rewardsData && rewardsData.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-4 text-xs text-low">
          {REWARD_SERIES.map((series) => (
            <div key={series.label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 min-w-2 rounded-full"
                style={{
                  background: series.swatch,
                  // A near-transparent fill is invisible as an 8px dot, so
                  // the series drawn as an outline is keyed as one too.
                  border:
                    'outline' in series
                      ? `1px solid ${series.outline}`
                      : undefined,
                }}
              />
              <span>{series.label}</span>
            </div>
          ))}
          {hasPending && (
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"
              />
              <span>Split pending</span>
            </div>
          )}
          {hasUnavailable && (
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"
              />
              <span>Split not available</span>
            </div>
          )}
          {hasSkipped && (
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 min-w-2 rounded-full border border-dashed border-[rgba(202,202,214,0.6)]"
              />
              <span>Not paid</span>
            </div>
          )}
          {/* The unit toggle only renders once prices exist, so without this
              the axis is a column of bare numbers on every network that has
              none, and on mobile where the toggle is easiest to miss. */}
          <span className="ml-auto">
            {unit === 'usd' ? 'USD' : ticker || 'ARIO'}
          </span>
        </div>
      )}
      {unit === 'usd' && unpricedCount > 0 && (
        <div className="px-5 pb-4 text-xs text-low">
          {unpricedCount} epoch{unpricedCount === 1 ? '' : 's'} not priced yet —
          each epoch is valued at its own closing price.
        </div>
      )}
    </div>
  );
};

export default RewardsDistributionPanel;
