import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { InfoIcon } from '@src/components/icons';
import StakingModal from '@src/components/modals/StakingModal';
import useSmartDelegate from '@src/hooks/useSmartDelegate';
import { useGlobalState } from '@src/store';
import { formatAddress, formatWithCommas } from '@src/utils';
import {
  MIN_EPOCH_HISTORY,
  SMART_DELEGATE_VERSION,
  type SmartDelegateResult,
} from '@src/utils/smartDelegate';
import { useState } from 'react';

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

const ResultRow = ({
  result,
  maxConsecutiveFailures,
  medianDelegatedStake,
  realizedReturn,
  onDelegate,
}: {
  result: SmartDelegateResult;
  maxConsecutiveFailures: number | undefined;
  medianDelegatedStake: number | undefined;
  /** Measured annualised return for this gateway's delegates, if any. */
  realizedReturn: number | undefined;
  onDelegate: () => void;
}) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { gateway } = result;

  // SD-1.4. Omitted entirely when the threshold is unknown rather than
  // compared against a guess.
  const nearPrune =
    maxConsecutiveFailures !== undefined &&
    result.failedConsecutiveEpochs > 0 &&
    maxConsecutiveFailures - result.failedConsecutiveEpochs <=
      PRUNE_WARNING_WINDOW;

  const stakeNote = result.noDelegatesYet
    ? 'No delegates yet'
    : medianDelegatedStake !== undefined
      ? result.totalDelegatedStake >= medianDelegatedStake
        ? 'Above the network median'
        : 'Below the network median'
      : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-grey-800 p-4">
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

      {/* The measured figure, where one exists. Deliberately second: it is a
          fact rather than an estimate, but it describes other people's
          positions rather than the one being considered. */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y border-grey-800 py-2 text-xs">
        {realizedReturn !== undefined ? (
          <>
            <span className="text-low">
              Delegates here have actually earned
            </span>
            <span className="text-high">{pct(realizedReturn)} a year</span>
            <span className="text-low">
              on the stake they hold, across the published history.
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

const EmptyState = ({
  state,
  ticker,
}: {
  state: ReturnType<typeof useSmartDelegate>;
  ticker: string;
}) => {
  const reason = state.emptyReason;

  // SD-1.7: name the rule that emptied the list. "No matches" would invite
  // the conclusion that the network has nothing to offer, when the usual
  // answer is an amount one keystroke away from working.
  if (reason?.kind === 'amountBelowEveryMinimum') {
    return (
      <div className="text-sm text-mid">
        No gateway accepts a delegation that small. The lowest minimum among the
        gateways open to you is {formatWithCommas(reason.lowestMinimum)}{' '}
        {ticker}.
      </div>
    );
  }
  if (reason?.kind === 'noRewardAvailable') {
    return (
      <div className="text-sm text-mid">
        This epoch&apos;s rewards have not been set yet, so there is no figure
        to rank on. This resolves within a few minutes of an epoch starting.
      </div>
    );
  }
  if (reason?.kind === 'noGateways') {
    return (
      <div className="text-sm text-mid">
        The gateway list could not be read, so there is nothing to rank.
      </div>
    );
  }
  return (
    <div className="text-sm text-mid">
      No gateway is currently eligible. A gateway needs at least{' '}
      {MIN_EPOCH_HISTORY} epochs of history, must be accepting delegations, and
      cannot be your own.
    </div>
  );
};

/**
 * Smart Delegate: rank gateways by expected yield for an amount, then hand the
 * gateway and the amount to the existing staking flow.
 *
 * This card selects and explains. It never calls the write SDK, never
 * invalidates a query key and never marks a snapshot document written — those
 * belong to `StakingModal` and `ReviewStakeModal`, which are unchanged.
 */
const SmartDelegateCard = () => {
  const ticker = useGlobalState((state) => state.ticker);
  const [amountText, setAmountText] = useState<string>('');
  const [selected, setSelected] = useState<SmartDelegateResult | undefined>();

  const amount = Number.parseFloat(amountText);
  const state = useSmartDelegate(Number.isFinite(amount) ? amount : 0);

  return (
    <div className="rounded-xl border border-grey-600">
      <div className="flex flex-col gap-1 border-b border-grey-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-sm text-high">Smart Delegate</div>
          <Tooltip
            message={
              <div className="flex flex-col gap-2">
                <p>
                  Each epoch the network pays every eligible gateway the same
                  reward. A gateway passes a share of that to its delegates, and
                  that share is split by how much each has staked — so the less
                  stake a gateway already carries, the more each of your tokens
                  earns there.
                </p>
                <p>
                  This ranks gateways on exactly that, weighted by how often
                  each one actually gets paid and discounted sharply if it is
                  failing right now. It never moves funds: picking one opens the
                  normal staking dialog, which still asks your wallet to sign.
                </p>
              </div>
            }
          >
            <InfoIcon className="size-[1.125rem]" />
          </Tooltip>
        </div>
        <div className="text-xs text-low">
          Rewards are split by stake, so the same delegation earns more where
          less is already delegated. Enter an amount to see where yours would
          earn most.
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex h-[3.25rem] max-w-md items-center overflow-hidden rounded-md border border-grey-800">
          <input
            className="size-full grow bg-grey-1000 px-6 py-3 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
            type="text"
            inputMode="decimal"
            placeholder={`Amount of ${ticker} to delegate`}
            value={amountText}
            onChange={(e) => {
              const next = e.target.value;
              if (next && Number.isNaN(Number(next))) {
                return;
              }
              setAmountText(next);
            }}
          />
        </div>

        {amountText.length === 0 ? (
          <div className="text-sm text-mid">
            Enter an amount above to rank gateways for it. The amount matters:
            it is part of the denominator, so it changes the order among
            gateways that already hold delegated stake.
          </div>
        ) : state.status === 'loading' ? (
          <div className="flex flex-col gap-3">
            <Placeholder className="h-24" />
            <Placeholder className="h-24" />
          </div>
        ) : state.results.length === 0 ? (
          <EmptyState state={state} ticker={ticker} />
        ) : (
          <div className="flex flex-col gap-3">
            {state.results.map((result) => (
              <ResultRow
                key={result.gateway.gatewayAddress}
                result={result}
                maxConsecutiveFailures={state.maxConsecutiveFailures}
                medianDelegatedStake={state.medianDelegatedStake}
                realizedReturn={state.realizedReturns.get(
                  result.gateway.gatewayAddress,
                )}
                onDelegate={() => setSelected(result)}
              />
            ))}
            <div className="text-xs text-low">
              Ranked by reward per token for {formatWithCommas(amount)} {ticker}
              , which favours gateways carrying less delegated stake. Across the
              published history, gateways in the lowest quarter by delegated
              stake have returned roughly twenty times those in the highest.{' '}
              {SMART_DELEGATE_VERSION}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <StakingModal
          open={true}
          ownerWallet={selected.gateway.gatewayAddress}
          initialAmount={amountText}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  );
};

export default SmartDelegateCard;
