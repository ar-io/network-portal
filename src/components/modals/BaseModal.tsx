import { Dialog } from '@headlessui/react';
import { ReactElement } from 'react';
import { CloseIcon } from '../icons';

const BaseModal = ({
  open,
  onClose,
  children,
  showCloseButton = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactElement;
  showCloseButton?: boolean;
}) => {
  return (
    <Dialog open={open} onClose={() => {}} className="relative z-10">
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="relative items-stretch rounded-[12px] bg-[#111112] p-[32px] text-center text-grey-100">
          {showCloseButton && (
            <button className="absolute right-[-28px] top-0" onClick={onClose}>
              <CloseIcon />
            </button>
          )}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BaseModal;