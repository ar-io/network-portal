import { AoGatewayWithAddress, mIOToken } from '@ar.io/sdk/web';
import Button, { ButtonType } from '@src/components/Button';
import OperatorStakingModal from '@src/components/modals/OperatorStakingModal';
import Placeholder from '@src/components/Placeholder';
import Tooltip from '@src/components/Tooltip';
import { EAY_TOOLTIP_TEXT, OPERATOR_EAY_TOOLTIP_FORMULA } from '@src/constants';
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
  const [eay, setEAY] = useState<number>();

  useEffect(() => {
    if (gateways && gateway && protocolBalance) {
      const rewards = calculateOperatorRewards(
        new mIOToken(protocolBalance).toIO(),
        Object.values(gateways).filter((g) => g.status == 'joined').length,
        gateway,
        new mIOToken(gateway.operatorStake).toIO(),
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
            <Button
              buttonType={ButtonType.SECONDARY}
              className="*:text-gradient h-[1.875rem]"
              active={true}
              title="Manage Stake"
              text="Manage Stake"
              onClick={() => setIsStakingModalOpen(true)}
            />
          )}
      </div>
      <div className="flex items-center gap-2 p-6">
        {gateway ? (
          <>
            <div className="grow whitespace-nowrap text-mid">
              {formatWithCommas(
                new mIOToken(gateway?.operatorStake).toIO().valueOf(),
              )}{' '}
              {ticker}{' '}
              {gateway?.status === 'leaving' && '(Gateway Leaving Network)'}
            </div>
            <div className="flex items-center gap-1 text-sm text-mid">
              {eay !== undefined ? formatPercentage(eay) : <Placeholder />} EAY
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
    </div>
  );
};

export default OperatorStake;