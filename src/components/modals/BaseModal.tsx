import { Dialog } from '@headlessui/react';
import { ReactElement } from 'react';
import { CloseIcon } from '../icons';

const BaseModal = ({
  onClose,
  children,
  showCloseButton = true,
  useDefaultPadding = true,
}: {
  onClose: () => void;
  children: ReactElement;
  showCloseButton?: boolean;
  useDefaultPadding?: boolean;
}) => {
  return (
    <Dialog open={true} onClose={() => {}} className="relative z-10">
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex  w-screen items-center justify-center p-4">
        <Dialog.Panel
          className={`relative flex max-h-full flex-col items-stretch rounded-[12px] bg-[#111112] ${useDefaultPadding ? 'p-[32px]' : ''} text-center text-grey-100`}
        >
          {showCloseButton && (
            <button className="absolute right-[-28px] top-0" onClick={onClose}>
              <CloseIcon />
            </button>
          )}
          <div className="flex grow flex-col overflow-y-auto scrollbar">
            {children}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BaseModal;
