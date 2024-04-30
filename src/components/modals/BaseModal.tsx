import { Dialog } from '@headlessui/react';
import { CloseIcon } from '../icons';
import { ReactElement } from 'react';

const BaseModal = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactElement;
}) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-sm items-stretch rounded-[12px] bg-[#111112] p-[32px] text-center text-grey-100">
          <button className="absolute right-[-28px] top-0" onClick={onClose}>
            <CloseIcon />
          </button>
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BaseModal;
