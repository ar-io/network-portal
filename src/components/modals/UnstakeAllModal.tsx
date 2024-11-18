import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS, log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { showErrorToast } from '@src/utils/toast';
import { useState } from 'react';
import Button, { ButtonType } from '../Button';
import BaseModal from './BaseModal';
import UnstakeWarning from './UnstakeWarning';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';
import { useQueryClient } from '@tanstack/react-query';

const UnstakeAllModal = ({
  onClose,
  activeStakes,
}: {
  onClose: () => void;
  activeStakes: { owner: string; delegatedStake: number; gateway: AoGateway }[];
}) => {
  const queryClient = useQueryClient();

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
                decreaseQty: stake.delegatedStake, // read and write value both in mIO
              },
              WRITE_OPTIONS,
            );

            log.info(`Decrease Delegate Stake txID: ${txID}`);
          }
        }

        queryClient.invalidateQueries({
          queryKey: ['gateway', walletAddress.toString()],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['gateways'],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: ['delegateStakes'],
          refetchType: 'all',
        });

        setShowSuccessModal(true);
      } catch (e: any) {
        showErrorToast(`${e}`);
      } finally {
        setShowBlockingMessageModal(false);
      }
    }
  };

  return (
    <>
      <BaseModal onClose={onClose} useDefaultPadding={false}>
        <div className="w-[28.4375rem] text-left">
          <div className="px-8  pb-4 pt-6">
            <div className="text-lg text-high">Unstake All</div>
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
                    {new mIOToken(stake.delegatedStake).toIO().valueOf()}{' '}
                    {ticker}
                  </td>
                </tr>
              ))}
            </table>

            <UnstakeWarning />
          </div>

          <div className="px-8 pb-8 pt-6">
            <div className="flex gap-2 text-sm text-mid">
              <div className="grow">Fee:</div>
              <div>- AR</div>
            </div>
            <div className="mt-1 flex text-sm text-mid">
              <div className="grow">Total Withdrawal:</div>
              <div>
                {new mIOToken(totalWithdrawalMIO).toIO().valueOf()} {ticker}
              </div>
            </div>

            <div className="mt-6 flex grow justify-center">
              <Button
                onClick={processWithdrawAll}
                buttonType={ButtonType.PRIMARY}
                title="Unstake"
                text={<div className="py-2">Unstake</div>}
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

export default UnstakeAllModal;
