import Placeholder from '@src/components/Placeholder';
import { PinkArrowIcon } from '@src/components/icons';
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
import { ResultRow } from './SmartDelegateResultRow';

const _pct = (ratio: number) =>
  `${(ratio * 100).toLocaleString('en-us', { maximumFractionDigits: 2 })}%`;

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
/**
 * Smart Delegate: rank gateways by what an amount would earn, then hand the
 * gateway and the amount to the existing staking flow.
 *
 * One row until it is used. The staking page already stacks five blocks above
 * the gateway table, and an always-open panel that is empty until someone
 * types was a sixth — about 150px of header, subtitle and placeholder saying
 * nothing. The input is the affordance, so keeping it visible keeps the
 * feature discoverable without the chrome; results unfold underneath.
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
  const entered = amountText.trim().length > 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-grey-800">
      {/* A wash of the brand gradient behind the prompt, at the same weight
          the extension tags use for their subtle variant. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-gradient-primary-start/20 to-gradient-primary-end/20 opacity-60"
      />

      <div className="relative z-10 flex flex-wrap items-center gap-x-6 gap-y-4 p-6">
        <div className="min-w-[16rem] flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="text-gradient text-lg font-medium">
              Find where your stake earns most
            </div>
            <PinkArrowIcon className="size-3 shrink-0" />
          </div>
          <div className="max-w-2xl text-xs text-mid">
            Rewards are split by stake, so the same delegation earns more where
            less is already delegated. Enter an amount to rank every gateway for
            it.
          </div>
        </div>

        <div className="flex h-[3.25rem] w-full items-center overflow-hidden rounded-md border border-grey-700 bg-grey-1000 sm:w-64">
          <input
            className="size-full grow bg-transparent px-5 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high"
            type="text"
            inputMode="decimal"
            placeholder="Amount"
            aria-label={`Amount of ${ticker} to delegate`}
            value={amountText}
            onChange={(e) => {
              const next = e.target.value;
              if (next && Number.isNaN(Number(next))) {
                return;
              }
              setAmountText(next);
            }}
          />
          <div className="shrink-0 pr-5 text-sm text-low">{ticker}</div>
        </div>
      </div>

      {entered && (
        <div className="relative z-10 flex flex-col gap-3 border-t border-grey-700 px-6 pb-6 pt-5">
          {state.status === 'loading' ? (
            <>
              <Placeholder className="h-24" />
              <Placeholder className="h-24" />
            </>
          ) : state.results.length === 0 ? (
            <EmptyState state={state} ticker={ticker} />
          ) : (
            <>
              {state.results.map((result) => (
                <ResultRow
                  key={result.gateway.gatewayAddress}
                  result={result}
                  maxConsecutiveFailures={state.maxConsecutiveFailures}
                  medianDelegatedStake={state.medianDelegatedStake}
                  realizedReturn={state.realizedReturns.get(
                    result.gateway.gatewayAddress,
                  )}
                  ticker={ticker}
                  onDelegate={() => setSelected(result)}
                />
              ))}
              <div className="text-xs text-low">
                Ranked by reward per token for {formatWithCommas(amount)}{' '}
                {ticker}, which favours gateways carrying less delegated stake.
                Across the published history, gateways in the lowest quarter by
                delegated stake have returned roughly twenty times those in the
                highest. {SMART_DELEGATE_VERSION}
              </div>
            </>
          )}
        </div>
      )}

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
