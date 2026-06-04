import { Gateway, mARIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS, log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import WithdrawWarning from './WithdrawWarning';

// Space batched Solana withdrawals out so each transaction is built with
// fresh vault PDA seeds instead of reusing the just-created withdrawal vault.
const WITHDRAW_ALL_TRANSACTION_DELAY_MS = 1_200;

const waitForNextWithdrawalTransaction = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, WITHDRAW_ALL_TRANSACTION_DELAY_MS);
  });

const getWithdrawableStakes = (
  stakes: { owner: string; delegatedStake: number; gateway: Gateway }[],
) =>
  [...stakes]
    .filter((stake) => stake.delegatedStake > 0)
    .sort((a, b) => b.delegatedStake - a.delegatedStake);

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remainingStakes, setRemainingStakes] = useState(() =>
    getWithdrawableStakes(activeStakes),
  );

  const walletAddress = useGlobalState((state) => state.walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);
  const ticker = useGlobalState((state) => state.ticker);

  const totalWithdrawalMIO = remainingStakes.reduce(
    (acc, stake) => acc + stake.delegatedStake,
    0,
  );

  const refreshStakeQueries = () => {
    if (!walletAddress) {
      return;
    }

    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['gateway', walletAddress.toString()],
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['gateways'],
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['delegateStakes'],
        refetchType: 'all',
      }),
    ]).catch((error) => {
      log.error('Failed to refresh stakes after withdraw all', error);
    });
  };

  useEffect(() => {
    if (!showSuccessModal && !isProcessing && remainingStakes.length === 0) {
      onClose();
    }
  }, [isProcessing, onClose, remainingStakes.length, showSuccessModal]);

  const processWithdrawAll = async () => {
    if (isProcessing) {
      return;
    }

    if (remainingStakes.length === 0) {
      onClose();
      return;
    }

    if (walletAddress && arIOWriteableSDK) {
      let completedWithdrawal = false;
      setIsProcessing(true);
      setShowBlockingMessageModal(true);

      try {
        for (const [index, stake] of remainingStakes.entries()) {
          if (index > 0) {
            await waitForNextWithdrawalTransaction();
          }

          const { id: txID } = await arIOWriteableSDK.decreaseDelegateStake(
            {
              target: stake.owner,
              decreaseQty: stake.delegatedStake, // read and write value both in mIO
            },
            WRITE_OPTIONS,
          );

          completedWithdrawal = true;
          setRemainingStakes((currentStakes) =>
            currentStakes.filter(
              (currentStake) => currentStake.owner !== stake.owner,
            ),
          );

          log.info(`Decrease Delegate Stake txID: ${txID}`);
        }

        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
        setIsProcessing(false);

        if (completedWithdrawal) {
          refreshStakeQueries();
        }
      }
    }
  };

  return (
    <>
      {!showSuccessModal && (
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
                {remainingStakes.map((stake) => (
                  <tr key={stake.owner} className="text-sm">
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
                  {new mARIOToken(totalWithdrawalMIO).toARIO().valueOf()}{' '}
                  {ticker}
                </div>
              </div>

              <div className="mt-6 flex grow justify-center">
                <Button
                  onClick={processWithdrawAll}
                  disabled={isProcessing}
                  buttonType={ButtonType.PRIMARY}
                  title="Withdraw"
                  text={<div className="py-2">Withdraw</div>}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </BaseModal>
      )}
      {showBlockingMessageModal && (
        <BlockingMessageModal
          onClose={() => setShowBlockingMessageModal(false)}
          message="Sign the following data with your wallet to proceed."
        ></BlockingMessageModal>
      )}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false);
            onClose();
          }}
          title="Congratulations"
          bodyText="You have successfully withdrawn all stakes."
        />
      )}
    </>
  );
};

export default WithdrawAllModal;
