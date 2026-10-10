import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import { formatAddress, formatWithCommas } from '@src/utils';
import {
  EPOCHS_PER_YEAR,
  type SmartDelegateResult,
} from '@src/utils/smartDelegate';

/** Within this many of the prune threshold, SD-1.4 says so explicitly. */
const PRUNE_WARNING_WINDOW = 5;

/** Small ARIO amounts need decimals; large ones do not. */
const formatARIO = (value: number) =>
  value >= 100
    ? formatWithCommas(Math.round(value))
    : value.toLocaleString('en-us', { maximumFractionDigits: 2 });

const pct = (ratio: number) =>
  `${(ratio * 100).toLocaleString('en-us', { maximumFractionDigits: 2 })}%`;

const EstimateTooltip = () => (
  <Tooltip
    message={
      <div className="flex flex-col gap-2">
        <p>
          One epoch ahead, not a year. It takes this epoch&apos;s per-gateway
          reward from the network, keeps the share this gateway passes to its
          delegates, weights it by how often the gateway actually gets paid, and
          splits it by stake.
        </p>
        <p>
          Shown per epoch on purpose. Annualising it compounds a year of
          assumptions onto a reward the protocol resets daily, which produces
          figures in the hundreds of percent for a small delegation to an empty
          gateway — arithmetically correct, and not a promise anyone can keep.
        </p>
        <p>
          It is still an upper bound. The reward changes every epoch as the rate
          decays and the eligible gateway count moves, other delegates dilute
          your share by arriving, and a gateway&apos;s record can get worse than
          its history suggests. The observer reward is excluded.
        </p>
      </div>
    }
  >
    <InfoIcon className="size-[1.125rem]" />
  </Tooltip>
);

const Figure = ({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) => (
  <div className="flex flex-col gap-0.5">
    <div className="text-xs text-low">{label}</div>
    <div className="text-sm text-high">{value}</div>
    {note && <div className="text-xs text-low">{note}</div>}
  </div>
);

/**
 * One ranked gateway.
 *
 * Presentational: it takes a ranked result and a ticker and reads nothing
 * else. It used to read the ticker from the global store, which pulled the
 * store — and through it an RPC client and the SDK logger — into anything
 * that wanted to render a row, so the layout could not be exercised against
 * real data outside a running app. Mainnet labels run long and carry emoji,
 * which is exactly what needs looking at.
 */
export const ResultRow = ({
  result,
  maxConsecutiveFailures,
  medianDelegatedStake,
  realizedReturn,
  realizedEpochs,
  amount,
  ticker,
  onDelegate,
}: {
  result: SmartDelegateResult;
  maxConsecutiveFailures: number | undefined;
  medianDelegatedStake: number | undefined;
  /** Measured annualised return for this gateway's delegates, if any. */
  realizedReturn: number | undefined;
  /** Epochs the measured figure averages over, for stating the period. */
  realizedEpochs: number | undefined;
  /** The amount being considered, in ARIO. */
  amount: number;
  ticker: string;
  onDelegate: () => void;
}) => {
  const { gateway } = result;

  // SD-1.4. Omitted entirely when the threshold is unknown rather than
  // compared against a guess.
  const nearPrune =
    maxConsecutiveFailures !== undefined &&
    result.failedConsecutiveEpochs > 0 &&
    maxConsecutiveFailures - result.failedConsecutiveEpochs <=
      PRUNE_WARNING_WINDOW;

  // Said as competition rather than as a ranking against the median. More
  // delegated stake is the main negative in this model — it is the
  // denominator — but "above the network median" reads as a popularity badge,
  // so a reader could take the worst signal on the card for reassurance.
  //
  // "with delegates" is not padding. The median is taken over gateways that
  // hold some delegated stake, because more than half the delegation-open
  // roster holds none and including them would put it at zero. Against the
  // whole roster the claim can inverse: a gateway with 500 ARIO delegated
  // sits below the median of staked gateways, yet has more competition than
  // the 138 holding nothing at all.
  const stakeNote = result.noDelegatesYet
    ? 'Nobody is sharing the rewards yet'
    : medianDelegatedStake !== undefined
      ? result.totalDelegatedStake >= medianDelegatedStake
        ? 'More competition than most gateways with delegates'
        : 'Less competition than most gateways with delegates'
      : undefined;

  return (
    // `containerL0` with a lighter edge, because the row now nests inside a
    // `bg-grey-800` card: a `border-grey-800` row against a `grey-800` card has
    // no edge at all, and the three results ran together as one block.
    <div className="flex flex-col gap-3 rounded-lg border border-grey-700 bg-containerL0 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <div className="text-sm text-high">{gateway.settings.label}</div>
          <div className="text-xs text-low">
            {gateway.settings.fqdn} · {formatAddress(gateway.gatewayAddress)}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold leading-none text-high">
              +{formatARIO(result.expectedEpochReward)}
            </div>
            <div className="text-sm text-high">{ticker}</div>
            <EstimateTooltip />
          </div>
          <div className="text-xs text-low">estimated, next epoch (~1 day)</div>
        </div>
      </div>

      {result.similarCount > 1 && (
        <div className="-mt-1 text-xs text-low">
          Shown once for {result.similarCount} gateways with the same figures,
          because there is nothing here to choose between them.
        </div>
      )}

      {/* The measured figure, where one exists. Deliberately second: it is a
          fact rather than an estimate, but it describes other people's
          positions rather than the one being considered. */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y border-grey-800 py-2 text-xs">
        {realizedReturn !== undefined ? (
          <>
            {/* A rate, applied to the amount being considered — not a
                payment anyone received. No delegate here necessarily held
                this amount, so "delegates earned X on 1,000" would assert a
                transaction that never happened. */}
            <span className="text-low">
              At the rate delegates here have been paid,{' '}
              {formatWithCommas(amount)} {ticker} would have returned about
            </span>
            <span className="text-high">
              +{formatARIO((realizedReturn * amount) / EPOCHS_PER_YEAR)}{' '}
              {ticker} a day
            </span>
            <span className="text-low">
              {realizedEpochs !== undefined
                ? `, averaged over ${formatWithCommas(realizedEpochs)} epochs`
                : ''}
              . The estimate above assumes today's pool and reward; this covers
              a stretch when both were different.
            </span>
          </>
        ) : (
          <span className="text-low">
            No delegate has been paid at this gateway yet, so there is no
            measured return to compare against.
          </span>
        )}
      </div>

      {/* The four inputs behind the headline, so it can be recomputed. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure
          label="Reward share"
          value={`${result.rewardShareRatio}%`}
          note="To delegates"
        />
        <Figure
          label="Pass rate"
          value={
            result.passRate !== undefined ? pct(result.passRate) : 'Unknown'
          }
          note={`${formatWithCommas(result.passedEpochCount)} of ${formatWithCommas(result.totalEpochCount)} epochs`}
        />
        <Figure
          label="Current streak"
          value={
            result.failedConsecutiveEpochs > 0
              ? `${result.failedConsecutiveEpochs} failed`
              : 'Passing'
          }
          note={
            result.failedConsecutiveEpochs > 0
              ? 'Consecutive, right now'
              : undefined
          }
        />
        <Figure
          label="Delegated stake"
          value={`${formatWithCommas(Math.round(result.totalDelegatedStake))} ${ticker}`}
          note={stakeNote}
        />
      </div>

      {nearPrune && (
        <div className="rounded-md border border-red-400/40 bg-red-400/5 px-3 py-2 text-xs text-mid">
          On {result.failedConsecutiveEpochs} consecutive failed epochs, against
          a limit of {maxConsecutiveFailures}. At the limit anyone can remove
          this gateway, and doing so slashes the operator&apos;s entire minimum
          stake.
        </div>
      )}

      <div className="text-xs text-low">
        {result.poolShare >= 0.999
          ? 'You would be the only delegate here, so the whole delegate share would be yours — and every later delegate takes directly from it.'
          : `You would own ${pct(result.poolShare)} of this gateway's delegate pool. Rewards are split by stake, so your share falls as others delegate.`}
      </div>

      {result.existingStake > 0 && (
        <div className="text-xs text-low">
          You already delegate {formatWithCommas(result.existingStake)} {ticker}{' '}
          here.
        </div>
      )}

      <button
        type="button"
        onClick={onDelegate}
        className="self-start rounded-md border border-grey-700 px-4 py-2 text-sm text-high hover:bg-grey-800"
      >
        Delegate to this gateway
      </button>
    </div>
  );
};
