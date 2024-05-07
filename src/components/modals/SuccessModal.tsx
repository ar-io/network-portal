import Button, { ButtonType } from '../Button';
import { SuccessCheck } from '../icons';
import BaseModal from './BaseModal';

const SuccessModal = ({
  open,
  onClose,
  title,
  bodyText,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  bodyText: string;
}) => {
  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="w-[392px]">
        <div className="flex grow justify-center pb-[12px]">
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
        </div>
      </div>
    </BaseModal>
  );
};

export default SuccessModal;
