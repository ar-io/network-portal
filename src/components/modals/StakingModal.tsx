import { useState } from 'react';
import BaseModal from './BaseModal';

const StakingModal = ({
  open,
  onClose,
  ownerWallet,
}: {
  open: boolean;
  onClose: () => void;
  ownerWallet?: string;
}) => {
  const [tab, setTab] = useState<number>(0);

  const baseTabClassName = 'text-center py-6';
  const selectedTabClassNames = `${baseTabClassName} bg-grey-700 border-b border-red-400`;
  const nonSelectedTabClassNames = `${baseTabClassName} bg-grey-1000 text-low`;

  return (
    <BaseModal open={open} onClose={onClose} useDefaultPadding={false}>
      <div className="w-[456px] overflow-hidden rounded-t-lg">
        <div className="grid grid-cols-2">
          <button
            className={
              tab == 0 ? selectedTabClassNames : nonSelectedTabClassNames
            }
            onClick={() => setTab(0)}
          >
            <span className={tab ==0 ? 'text-gradient' : ''}>Staking</span>
          </button>
          <button
            className={
              tab == 1 ? selectedTabClassNames : nonSelectedTabClassNames
            }

            onClick={() => setTab(1)}
          >
            <span className={tab ==1 ? 'text-gradient' : ''}>Unstaking</span>
          </button>
        </div>
        {/* <div className="flex grow justify-center pb-[12px]">
          <SuccessCheck className="size-[32px]" />
        </div>
        <div className="pb-[12px] text-2xl text-high">{title}</div>
        <div className="pb-[32px] text-center  text-low">{bodyText}</div>
        <div className="flex grow justify-center">
          <Button
            onClick={onClose}
            buttonType={ButtonType.PRIMARY}
            title="Close"
            text="Close"
          />
        </div> */}
      </div>
    </BaseModal>
  );
};

export default StakingModal;
