import { Gateway, mARIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS, log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { describeGarError } from '@src/utils/garErrors';
import { getErrorMessage } from '@src/utils/getErrorMessage';
import { invalidateWrittenDocuments } from '@src/utils/snapshotFreshness';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import WithdrawWarning from './WithdrawWarning';

/**
 * True when the program refused because the delegation account is gone.
 *
 * A full `decreaseDelegateStake` empties the delegation, and the program then
 * closes it in a **separate** `CloseEmptyDelegation` transaction moments
 * later — 27 seconds, in the case this was diagnosed from. Any attempt after
 * that simulates against a PDA that no longer exists and fails with Anchor's
 * `AccountNotInitialized`, forever.
 *
 * The stake really was withdrawn; only this tab's copy of the list is behind.
 * So the row is refetched rather than left for the user to click again.
 */
const isClosedDelegation = (error: unknown): boolean => {
  const raw = getErrorMessage(error).toLowerCase();
  return raw.includes('0xbc4') || raw.includes('accountnotinitialized');
};

const WithdrawAllModal = ({
  onClose,
  activeStakes,
}: {
  onClose: () => void;
  activeStakes: { owner: string; delegatedStake: number; gateway: Gateway }[];
}) => {
  const queryClient = useQueryClient();

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const sorted = activeStakes.sort(
    (a, b) => b.delegatedStake - a.delegatedStake,
  );

  const withDelegatedStake = sorted.filter((stake) => stake.delegatedStake > 0);

  const totalWithdrawalMIO = activeStakes.reduce(
    (acc, stake) => acc + stake.delegatedStake,
    0,
  );

  const processWithdrawAll = async () => {
    if (walletAddress && arIOWriteableSDK) {
      setShowBlockingMessageModal(true);

      try {
        for (const stake of withDelegatedStake) {
          if (stake.delegatedStake > 0) {
            const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake(
              {
                target: stake.owner,
                decreaseQty: stake.delegatedStake, // read and write value both in mARIO
              },
              WRITE_OPTIONS,
            );

            log.info(`Decrease Delegate Stake txID: ${txID}`);
          }
        }

        // `['balances']` also keys `useBalances`, whose `sol` figure funds the
        // insufficient-SOL guards — every one of these pays fees even when no
        // ARIO moves. Invalidated but deliberately not marked: the published
        // balances document did not change, so forcing it live would buy the
        // most expensive scan on the network for nothing.
        queryClient.invalidateQueries({
          queryKey: ['balances'],
          refetchType: 'active',
        });
        invalidateWrittenDocuments(queryClient, 'gateways');
        queryClient.invalidateQueries({
          queryKey: ['gateway', walletAddress.toString()],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['delegateStakes'],
          refetchType: 'all',
        });

        onClose();
      } catch (e: any) {
        showErrorToast(describeGarError(e));
        // The list that offered this row is stale: clear it so the phantom
        // stake disappears instead of inviting another identical failure.
        if (isClosedDelegation(e)) {
          queryClient.invalidateQueries({ queryKey: ['delegateStakes'] });
        }
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

  return (
    <>
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Withdraw All</div>
            <div className="flex pt-2 text-xs text-low">
              Withdraw all delegated stakes.
            </div>
          </div>

          <div className="border-y border-grey-800 p-8">
            <table className="mb-8 w-full table-auto">
              {withDelegatedStake.map((stake, index) => (
                <tr key={index} className="text-sm">
                  <td className="py-2 text-low ">
                    {stake.gateway.settings.label}
                  </td>
                  <td className="py-2">
                    <a
                      className="text-gradient"
                      href={`https://${stake.gateway.settings.fqdn}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {stake.gateway.settings.fqdn}
                    </a>
                  </td>
                  <td className="py-2 text-right text-mid ">
                    {new mARIOToken(stake.delegatedStake).toARIO().valueOf()}{' '}
                    {ticker}
                  </td>
                </tr>
              ))}
            </table>

            <WithdrawWarning />
          </div>

          <div className="bg-containerL0 px-8 pb-8 pt-6">
            <div className="mt-1 flex text-sm text-mid">
              <div className="grow">Total Withdrawal:</div>
              <div>
                {new mARIOToken(totalWithdrawalMIO).toARIO().valueOf()} {ticker}
              </div>
            </div>

            <div className="mt-6 flex grow justify-center">
              <Button
                onClick={processWithdrawAll}
                buttonType={ButtonType.PRIMARY}
                title="Withdraw"
                text={<div className="py-2">Withdraw</div>}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </BaseModal>
      {showBlockingMessageModal && (
        <BlockingMessageModal
          onClose={() => setShowBlockingMessageModal(false)}
          message="Sign the following data with your wallet to proceed."
        ></BlockingMessageModal>
      )}
    </>
  );
};

export default WithdrawAllModal;
