import { GasEstimate } from '@ar.io/sdk/web';
import { formatSolFromLamports } from '@src/utils';

import LabelValueRow from './LabelValueRow';

/**
 * Solana network-cost rows for GAR action modals, split the way wallets
 * present it: the transaction fee, the rent deposited for accounts the
 * action creates (the bulk of the cost when present), their total, and —
 * when the action closes a withdrawal vault — the rent refunded back.
 *
 * Pass `insufficientSol` (wallet SOL < `gasEstimate.totalLamports`) to
 * highlight the requirement; gating the confirm button is the caller's job.
 */
const GasEstimateRows = ({
  gasEstimate,
  isLoading,
  insufficientSol = false,
}: {
  gasEstimate?: GasEstimate;
  isLoading?: boolean;
  insufficientSol?: boolean;
}) => {
  if (isLoading) {
    return (
      <LabelValueRow
        label="Network Fee (est.):"
        value={<span className="animate-pulse">estimating...</span>}
      />
    );
  }
  if (!gasEstimate) return null;
  const hasRent = gasEstimate.rentLamports > 0;
  return (
    <>
      <LabelValueRow
        label="Network Fee (est.):"
        value={`~${formatSolFromLamports(gasEstimate.feeLamports)} SOL`}
      />
      {hasRent && (
        <>
          <LabelValueRow
            label="Storage Rent (est.):"
            value={`~${formatSolFromLamports(gasEstimate.rentLamports)} SOL`}
          />
          <LabelValueRow
            label="Total SOL (est.):"
            value={`~${formatSolFromLamports(gasEstimate.totalLamports)} SOL`}
          />
        </>
      )}
      {gasEstimate.rentReclaimedLamports > 0 && (
        <LabelValueRow
          label="Rent Reclaimed:"
          value={`+${formatSolFromLamports(gasEstimate.rentReclaimedLamports)} SOL`}
        />
      )}
      {insufficientSol && (
        <div className="text-right text-[0.8125rem] text-text-red">
          Insufficient SOL to cover the network cost
        </div>
      )}
    </>
  );
};

export default GasEstimateRows;
