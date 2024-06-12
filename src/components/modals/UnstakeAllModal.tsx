import { AoGateway, mIOToken } from '@ar.io/sdk/web';
import { IO_LABEL, WRITE_OPTIONS, log } from '@src/constants';
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

        setShowSuccessModal(true);
        onClose();
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
        <div className="w-[455px] text-left">
          <div className="px-[32px]  pb-[16px] pt-[24px]">
            <div className="text-lg text-high">Unstake All</div>
            <div className="flex pt-[8px] text-xs text-low">
              Withdraw all delegated stakes.
            </div>
          </div>

          <div className="border-y border-grey-800 p-[32px]">
            <table className="mb-[32px] w-full table-auto">
              {withDelegatedStake.map((stake, index) => (
                <tr key={index} className="text-sm">
                  <td className="py-[8px] text-low ">
                    {stake.gateway.settings.label}
                  </td>
                  <td className="py-[8px]">
                    <a
                      className="text-gradient"
                      href={`https://${stake.gateway.settings.fqdn}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {stake.gateway.settings.fqdn}
                    </a>
                  </td>
                  <td className="py-[8px] text-right text-mid ">
                    {new mIOToken(stake.delegatedStake).toIO().valueOf()}{' '}
                    {IO_LABEL}
                  </td>
                </tr>
              ))}
            </table>

            <UnstakeWarning />
          </div>

          <div className="px-[32px] pb-[32px] pt-[24px]">
            <div className="flex gap-[8px] text-sm text-mid">
              <div className="grow">Fee:</div>
              <div>- AR</div>
            </div>
            <div className="mt-[4px] flex text-sm text-mid">
              <div className="grow">Total Withdrawal:</div>
              <div>
                {new mIOToken(totalWithdrawalMIO).toIO().valueOf()} {IO_LABEL}
              </div>
            </div>

            <div className="mt-[24px] flex grow justify-center">
              <Button
                onClick={processWithdrawAll}
                buttonType={ButtonType.PRIMARY}
                title="Unstake"
                text={<div className="py-[8px]">Unstake</div>}
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
          }}
          title="Congratulations"
          bodyText="You have successfully withdrawn all stakes."
        />
      )}
    </>
  );
};

export default UnstakeAllModal;
