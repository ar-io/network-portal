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
                ticker={ticker}
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
