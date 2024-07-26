import Button, { ButtonType } from '../Button';
import { SuccessCheck } from '../icons';
import BaseModal from './BaseModal';

const SuccessModal = ({
  onClose,
  title,
  bodyText,
}: {
  onClose: () => void;
  title: string;
  bodyText: string;
}) => {
  return (
    <BaseModal onClose={onClose}>
      <div className="w-[24.5rem]">
        <div className="flex grow justify-center pb-3">
          <SuccessCheck className="size-8" />
        </div>
        <div className="pb-3 text-2xl text-high">{title}</div>
        <div className="pb-8 text-center  text-low">{bodyText}</div>
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
