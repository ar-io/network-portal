import { mARIOToken } from '@ar.io/sdk/web';
import useEpochSettings from '@src/hooks/useEpochSettings';
import useGatewayRegistrySettings from '@src/hooks/useGatewayRegistrySettings';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import {
  GATEWAY_LEAVE_PERIOD_MS,
  formatDurationDays,
  formatPpmPercent,
} from '@src/utils/protocolSettings';
import { ReactNode, useMemo } from 'react';

export type ProtocolParameter = {
  label: string;
  value: string;
  tooltip: ReactNode;
};

export type ProtocolParametersVariant = 'operator' | 'delegate';

/**
 * The protocol's own limits, in the form the UI shows them.
 *
 * Shared rather than duplicated because these numbers appear in two places
 * that must never disagree: the standalone card, and the join banner that
 * tells a prospective operator what it takes to join. Most come from the same
 * settings account the write modals validate against, so what a user reads is
 * by construction what their transaction is held to.
 *
 * Two do not, because that account does not hold them and the SDK substitutes
 * a literal: the leave period is a program constant
 * (`GATEWAY_LEAVE_PERIOD_MS`), and the failure limit is read from
 * EpochSettings. Both are called out where they are used. Before adding a
 * parameter, check that the SDK reads it from chain rather than reporting a
 * hardcoded value — several of its `GatewayRegistrySettings` fields are
 * literals, and two of them are wrong.
 *
 * `parameters` is undefined until the read succeeds; callers render nothing or
 * a skeleton rather than inventing defaults.
 */
export const useProtocolParameters = (
  variant: ProtocolParametersVariant,
): {
  parameters: ProtocolParameter[] | undefined;
  isLoading: boolean;
  isError: boolean;
} => {
  const { data: settings, isLoading, isError } = useGatewayRegistrySettings();
  // `maxConsecutiveFailures` is the one displayed value that lives on the
  // EpochSettings account, and it resolves independently of the registry
  // settings beside it. A *failed* read renders that row as Unavailable
  // rather than showing the SDK's hardcoded stand-in; a read still in flight
  // renders an em dash, because the other query can resolve first and
  // "Unavailable" for a read that has not failed is the mistake the epoch
  // panels already made once.
  const { data: epochSettings, isError: epochSettingsError } =
    useEpochSettings();
  const maxConsecutiveFailures = epochSettings?.maxConsecutiveFailures;
  const ticker = useGlobalState((state) => state.ticker);

  const parameters = useMemo<ProtocolParameter[] | undefined>(() => {
    if (!settings) return undefined;

    const { delegates, operators, redelegations, expeditedWithdrawals } =
      settings;

    if (variant === 'operator') {
      return [
        {
          label: 'Min. operator stake',
          value: `${formatWithCommas(new mARIOToken(operators.minStake).toARIO().valueOf())} ${ticker}`,
          tooltip: `The stake a gateway must post to join the network, and the floor it must stay above to remain in it.`,
        },
        {
          label: 'Withdrawal period',
          value: formatDurationDays(operators.withdrawLengthMs),
          tooltip:
            'How long an operator stake withdrawal is locked in a vault before it can be claimed. An expedited withdrawal shortens this in exchange for a penalty.',
        },
        {
          label: 'Leave period',
          value: formatDurationDays(GATEWAY_LEAVE_PERIOD_MS),
          tooltip: `A departing gateway's stake splits across two vaults that unlock separately: one holding the minimum operator stake for ${formatDurationDays(
            GATEWAY_LEAVE_PERIOD_MS,
          )}, which cannot be expedited, and one holding the rest for the withdrawal period (${formatDurationDays(
            operators.withdrawLengthMs,
          )}), which can. A gateway removed for failed epochs is slashed the minimum operator stake first; whatever survives is then split the same way.`,
        },
        {
          label: 'Max failed epochs',
          value:
            maxConsecutiveFailures !== undefined
              ? formatWithCommas(maxConsecutiveFailures)
              : epochSettingsError
                ? 'Unavailable'
                : '—',
          tooltip: `A gateway that fails this many consecutive epochs is removed from the registry, and its minimum operator stake is slashed in full. Whatever survives the slash is vaulted as described under Leave period.`,
        },
        {
          label: 'Max reward share',
          value: `${operators.maxDelegateRewardSharePct}%`,
          tooltip:
            'The largest share of its epoch rewards a gateway may pass through to its delegates. The rest stays with the operator.',
        },
      ];
    }

    return [
      {
        label: 'Min. delegation',
        value: `${formatWithCommas(new mARIOToken(delegates.minStake).toARIO().valueOf())} ${ticker}`,
        tooltip: `The smallest stake you can delegate to a gateway, and the floor an existing delegation must stay above.`,
      },
      {
        label: 'Withdrawal period',
        value: formatDurationDays(delegates.withdrawLengthMs),
        tooltip:
          'How long a withdrawal is locked in a vault before it can be claimed. Stake in a withdrawal vault earns no rewards.',
      },
      {
        label: 'Redelegation fee',
        value: `${formatPpmPercent(redelegations.minRedelegationPenaltyRate)}–${formatPpmPercent(redelegations.maxRedelegationPenaltyRate)}`,
        tooltip: `Moving stake straight to another gateway skips the withdrawal period but costs a fee that climbs with each redelegation, up to ${formatPpmPercent(redelegations.maxRedelegationPenaltyRate)}.`,
      },
      {
        label: 'Fee reset',
        value: formatDurationDays(redelegations.redelegationFeeResetIntervalMs),
        tooltip:
          'Go this long without redelegating and the redelegation fee drops back to its minimum.',
      },
      {
        label: 'Expedited withdrawal',
        value: `${formatPpmPercent(expeditedWithdrawals.minExpeditedWithdrawalPenaltyRate)}–${formatPpmPercent(expeditedWithdrawals.maxExpeditedWithdrawalPenaltyRate)}`,
        tooltip: `Claiming a vaulted withdrawal early costs a penalty on this scale — nearest the low end when the vault is almost mature, the high end right after it opens. It stops falling at the low end and never reaches zero, so once a withdrawal matures, claim it instead: that returns the full amount and costs no penalty. Minimum ${formatWithCommas(new mARIOToken(expeditedWithdrawals.minExpeditedWithdrawalAmount).toARIO().valueOf())} ${ticker}.`,
      },
    ];
  }, [settings, ticker, variant, maxConsecutiveFailures, epochSettingsError]);

  return { parameters, isLoading, isError };
};
