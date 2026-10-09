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

const pct = (ratio: number) =>
  `${(ratio * 100).toLocaleString('en-us', { maximumFractionDigits: 2 })}%`;

const EstimateTooltip = () => (
  <Tooltip
    message={
      <div className="flex flex-col gap-2">
        <p>
          An estimate, not a rate. It divides this epoch&apos;s per-gateway
          reward by the stake that would be sharing it, so it is an upper bound
          for three reasons:
        </p>
        <p>
          The reward changes every epoch, as the protocol&apos;s reward rate
          decays and the number of eligible gateways moves. Other delegators can
          join the same gateway, which dilutes your share without anything going
          wrong. And a gateway&apos;s record can get worse than its history
          suggests.
        </p>
        <p>
          The observer reward is excluded, and a gateway with delegation enabled
          but no delegators keeps everything for its operator until someone
          stakes.
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
  onDelegate,
}: {
  result: SmartDelegateResult;
  maxConsecutiveFailures: number | undefined;
  medianDelegatedStake: number | undefined;
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
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold leading-none text-high">
            {pct(result.expectedEAY)}
          </div>
          <EstimateTooltip />
        </div>
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
              <p>
                Ranks gateways by the yield you could expect on the amount you
                enter, after weighting for how often each gateway actually gets
                paid. It never moves funds: picking one opens the normal staking
                dialog, which still asks your wallet to sign.
              </p>
            }
          >
            <InfoIcon className="size-[1.125rem]" />
          </Tooltip>
        </div>
        <div className="text-xs text-low">
          Enter an amount to see where it would earn most.
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
                onDelegate={() => setSelected(result)}
              />
            ))}
            <div className="text-xs text-low">
              Ranked by estimated annual yield for {formatWithCommas(amount)}{' '}
              {ticker}. {SMART_DELEGATE_VERSION}
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
