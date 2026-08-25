import { mARIOToken } from '@ar.io/sdk/web';
import { InfoIcon } from '@src/components/icons';
import useGatewayRegistrySettings from '@src/hooks/useGatewayRegistrySettings';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import {
  formatDurationDays,
  formatPpmPercent,
} from '@src/utils/protocolSettings';
import { ReactNode, useMemo } from 'react';
import Tooltip from './Tooltip';

type Parameter = {
  label: string;
  value: string;
  tooltip: ReactNode;
};

const Parameters = ({ parameters }: { parameters: Parameter[] }) => (
  <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
    {parameters.map(({ label, value, tooltip }) => (
      <div key={label} className="flex flex-col gap-1">
        <dt className="flex items-center gap-1 text-xs leading-none text-low">
          <span className="truncate">{label}</span>
          <Tooltip message={tooltip}>
            <InfoIcon className="size-3.5 shrink-0 text-low" />
          </Tooltip>
        </dt>
        <dd className="text-sm text-high">{value}</dd>
      </div>
    ))}
  </dl>
);

const ParametersSkeleton = () => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
    {Array.from({ length: 5 }, (_, index) => (
      <div key={index} className="flex flex-col gap-2">
        <div className="h-2.5 w-20 animate-pulse rounded bg-grey-700" />
        <div className="h-3.5 w-16 animate-pulse rounded bg-grey-700" />
      </div>
    ))}
  </div>
);

/**
 * The protocol's own rules, read from the same on-chain settings account the
 * write modals already validate against — so the numbers a user reads here are
 * by construction the ones their transaction will be held to, rather than
 * constants copied out of the docs that drift when governance moves them.
 *
 * `operator` covers joining and leaving the registry; `delegate` covers staking
 * to someone else's gateway. Both are supplementary: a failed read renders
 * nothing rather than blocking the page it sits on.
 */
const ProtocolParametersCard = ({
  variant,
}: {
  variant: 'operator' | 'delegate';
}) => {
  const { data: settings, isLoading } = useGatewayRegistrySettings();
  const ticker = useGlobalState((state) => state.ticker);

  const parameters = useMemo<Parameter[] | undefined>(() => {
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

  // Supplementary detail: if the settings read failed there is nothing useful
  // to show, and an error state here would only add noise to the page's own.
  if (!isLoading && !parameters) {
    return null;
  }

  return (
    <div className="rounded-xl border border-transparent-100-8 bg-containerL0 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-sm text-high">Network Rules</div>
        <div className="text-xs text-low">
          {variant === 'operator'
            ? 'set by the protocol for gateway operators'
            : 'set by the protocol for delegators'}
        </div>
      </div>
      {parameters ? (
        <Parameters parameters={parameters} />
      ) : (
        <ParametersSkeleton />
      )}
    </div>
  );
};

export default ProtocolParametersCard;
