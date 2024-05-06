import BaseModal from './BaseModal';

const BlockingMessageModal = ({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message: string;
}) => {
  return (
    <BaseModal open={open} onClose={onClose} showCloseButton={false}>
      <div className="w-[392px]">
        <div className="flex grow justify-center pb-[16px]">
          {/* <ConnectIcon className="size-[24px]" /> */}
        </div>
        <div className="text-sm text-mid">{message}</div>
      </div>
    </BaseModal>
  );
};

export default BlockingMessageModal;
