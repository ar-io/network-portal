import { AoGatewayWithAddress, ARIOToken, mARIOToken } from '@ar.io/sdk/web';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ThreeDotsIcon } from '@src/components/icons';
import OperatorStakingModal from '@src/components/modals/OperatorStakingModal';
import OperatorWithdrawalModal from '@src/components/modals/OperatorWithdrawalModal';
import RedelegateModal, { RedelegateModalProps } from '@src/components/modals/RedelegateModal';
import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { EAY_TOOLTIP_TEXT, GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO, OPERATOR_EAY_TOOLTIP_FORMULA } from '@src/constants';
import useGateways from '@src/hooks/useGateways';
import useProtocolBalance from '@src/hooks/useProtocolBalance';
import { useGlobalState } from '@src/store';
import { formatPercentage, formatWithCommas } from '@src/utils';
import { calculateOperatorRewards } from '@src/utils/rewards';
import { MathJax } from 'better-react-mathjax';
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type OperatorStakeProps = {
  gateway?: AoGatewayWithAddress;
  walletAddress?: string;
};

const OperatorStake = ({ gateway, walletAddress }: OperatorStakeProps) => {
  const ticker = useGlobalState((state) => state.ticker);
  const { data: protocolBalance } = useProtocolBalance();
  const { data: gateways } = useGateways();
  const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] =
    useState<boolean>(false);
  const [eay, setEAY] = useState<number>();

  const [showRedelegateModal, setShowRedelegateModal] =
    useState<RedelegateModalProps>();

  useEffect(() => {
    if (gateways && gateway && protocolBalance) {
      const rewards = calculateOperatorRewards(
        new mARIOToken(protocolBalance).toARIO(),
        Object.values(gateways).filter((g) => g.status == 'joined').length,
        gateway,
        new mARIOToken(gateway.operatorStake).toARIO(),
      );
      setEAY(rewards.EAY);
    }
  }, [gateway, gateways, protocolBalance]);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div className="flex items-center pl-6 pr-4 pt-4">
        <div className="grow items-center whitespace-nowrap text-mid">
          Operator Stake
        </div>

        {gateway?.gatewayAddress === walletAddress &&
          gateway?.status != 'leaving' && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                asChild
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="cursor-pointer rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end p-px">
                  <div className="inline-flex size-full items-center justify-start gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.3125rem] py-[.3125rem] shadow-inner">
                    <ThreeDotsIcon className="size-4" />
                  </div>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="z-50 rounded border border-grey-500 bg-containerL0 text-sm">
                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStakingModalOpen(true);
                  }}
                >
                  Add Stake
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWithdrawalModalOpen(true);
                  }}
                >
                  Withdraw Stake
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="cursor-pointer select-none px-4 py-2 outline-none  data-[highlighted]:bg-containerL3"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (gateway) {
                      setShowRedelegateModal({
                        sourceGateway: gateway,
                        onClose: () => setShowRedelegateModal(undefined),
                        maxRedelegationStake: new mARIOToken(
                          gateway.operatorStake -
                            new ARIOToken(GATEWAY_OPERATOR_STAKE_MINIMUM_ARIO)
                              .toMARIO()
                              .valueOf(),
                        ).toARIO(),
                      });
                    }
                  }}
                >
                  Redelegate
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
      </div>
      <div className="flex items-center gap-2 p-6">
        {gateway ? (
          <>
            <div className="grow whitespace-nowrap text-mid">
              {formatWithCommas(
                new mARIOToken(gateway?.operatorStake).toARIO().valueOf(),
              )}{' '}
              {ticker}{' '}
              {gateway?.status === 'leaving' && '(Gateway Leaving Network)'}
            </div>
            {gateway.status === 'joined' && (
              <div className="flex items-center gap-1 text-sm text-mid">
                {eay !== undefined ? formatPercentage(eay) : <Placeholder />}{' '}
                EAY
                {''}
                <Tooltip
                  message={
                    <div>
                      <p>{EAY_TOOLTIP_TEXT}</p>
                      <MathJax className="mt-4">
                        {OPERATOR_EAY_TOOLTIP_FORMULA}
                      </MathJax>
                    </div>
                  }
                >
                  <InfoIcon className="size-4" />
                </Tooltip>
              </div>
            )}
          </>
        ) : (
          <Placeholder />
        )}
      </div>

      {isStakingModalOpen && gateway && (
        <OperatorStakingModal
          open={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
          gateway={gateway}
        />
      )}
      {isWithdrawalModalOpen && gateway && (
        <OperatorWithdrawalModal
          open={isWithdrawalModalOpen}
          onClose={() => setIsWithdrawalModalOpen(false)}
          gateway={gateway}
        />
      )}
      {showRedelegateModal && <RedelegateModal {...showRedelegateModal} />}
    </div>
  );
};

export default OperatorStake;
