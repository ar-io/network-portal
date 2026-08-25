import { mARIOToken } from '@ar.io/sdk/web';
import useGatewayRegistrySettings from '@src/hooks/useGatewayRegistrySettings';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import {
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
 * tells a prospective operator what it takes to join. They come from the same
 * settings account the write modals validate against, so what a user reads is
 * by construction what their transaction is held to.
 *
 * `parameters` is undefined until the read succeeds; callers render nothing or
 * a skeleton rather than inventing defaults.
 */
export const useProtocolParameters = (
  variant: ProtocolParametersVariant,
): { parameters: ProtocolParameter[] | undefined; isLoading: boolean } => {
  const { data: settings, isLoading } = useGatewayRegistrySettings();
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
          value: formatDurationDays(operators.leaveLengthMs),
          tooltip:
            'After leaving the network, how long a gateway’s remaining stake stays vaulted before it can be withdrawn.',
        },
        {
          label: 'Max failed epochs',
          value: formatWithCommas(operators.failedEpochCountMax),
          tooltip: `A gateway that fails this many consecutive epochs is removed from the registry. ${
            operators.failedGatewaySlashRate > 0
              ? `Its stake is slashed ${formatPpmPercent(operators.failedGatewaySlashRate)} on removal.`
              : 'No stake is slashed on removal at the current settings.'
          }`,
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
        tooltip: `Claiming a vaulted withdrawal early costs a penalty on this scale — nearest the low end when the vault is almost mature, the high end right after it opens. Minimum ${formatWithCommas(new mARIOToken(expeditedWithdrawals.minExpeditedWithdrawalAmount).toARIO().valueOf())} ${ticker}.`,
      },
    ];
  }, [settings, ticker, variant]);

  return { parameters, isLoading };
};
