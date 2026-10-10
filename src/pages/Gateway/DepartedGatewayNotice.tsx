import useClaimableWithdrawals from '@src/hooks/useClaimableWithdrawals';
import { useGlobalState } from '@src/store';
import { formatWithCommas } from '@src/utils';
import { Link } from 'react-router-dom';

/**
 * Shown where a gateway address resolves to no gateway.
 *
 * The registry lists gateways currently in the network, so one that has left
 * or been removed simply is not there — and the page rendered its whole shell
 * full of dashes, saying nothing. A departing operator followed their own
 * gateway's URL a month after leaving, found that, and reported their 20,000
 * ARIO as lost. It was in a matured withdrawal vault the whole time.
 *
 * So this answers the question the empty page provoked: where did it go, and
 * where is my stake.
 */
const DepartedGatewayNotice = ({ isOwnGateway }: { isOwnGateway: boolean }) => {
  const ticker = useGlobalState((state) => state.ticker);
  const claimable = useClaimableWithdrawals();

  return (
    <div className="rounded-lg border border-grey-700 bg-containerL0 p-4">
      <div className="text-sm text-high">
        This gateway is not in the network registry
      </div>
      <div className="mt-1 text-xs text-mid">
        The registry lists gateways currently in the network. One that has left,
        or been removed for failing too many epochs, drops out of it — so there
        is nothing here to show. Its stake is not affected by that.
      </div>

      {isOwnGateway && (
        <div className="mt-3 border-t border-grey-800 pt-3 text-xs text-mid">
          {claimable.total > 0 ? (
            <>
              <span className="text-high">
                You have at least{' '}
                {formatWithCommas(Math.round(claimable.total))} {ticker} ready
                to claim.
              </span>{' '}
              Leaving vaults your stake rather than returning it, and a vault
              whose date has passed is claimable, not paid — it takes a
              transaction you sign.{' '}
              <Link to="/balances" className="text-link">
                Claim it on Balances
              </Link>
              .
            </>
          ) : (
            <>
              If you left the network, your stake was vaulted rather than
              returned. Nothing comes back on its own: once a vault&apos;s date
              passes you claim it yourself, and until then it stays where it is.{' '}
              <Link to="/balances" className="text-link">
                Check Balances
              </Link>{' '}
              for anything waiting.
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartedGatewayNotice;
