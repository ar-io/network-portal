import Lottie from 'lottie-react';
import arioLoading from '../../animations/ario-spinner.json';
import BaseModal from './BaseModal';

const BlockingMessageModal = ({
  onClose,
  message,
}: {
  onClose: () => void;
  message: string;
}) => {
  return (
    <BaseModal onClose={onClose} showCloseButton={false}>
      <div className="flex w-[392px] flex-col items-center justify-center">
        <div className="flex size-[72px] items-center pb-[16px]">
          <Lottie
            animationData={arioLoading}
            loop={true}
            width={24}
            height={24}
          />
        </div>
        <div className="text-sm text-mid">{message}</div>
      </div>
    </BaseModal>
  );
};

export default BlockingMessageModal;