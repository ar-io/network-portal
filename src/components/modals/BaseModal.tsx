import { Dialog, DialogPanel } from '@headlessui/react';
import { ReactElement } from 'react';
import { CloseIcon } from '../icons';

const BaseModal = ({
  onClose,
  children,
  showCloseButton = true,
  useDefaultPadding = true,
  closeOnClickOutside = false,
}: {
  onClose: () => void;
  children: ReactElement;
  showCloseButton?: boolean;
  useDefaultPadding?: boolean;
  closeOnClickOutside?: boolean;
}) => {
  return (
    <Dialog
      open={true}
      onClose={closeOnClickOutside ? onClose : () => {}}
      className="relative z-10"
    >
      <div
        className="fixed inset-0 w-screen bg-neutrals-1100/80"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex  w-screen items-center justify-center p-4">
        <DialogPanel
          className={`relative flex max-h-full flex-col items-stretch rounded-xl bg-[#111112] ${useDefaultPadding ? 'p-8' : ''} border border-stroke-low text-center text-grey-100`}
        >
          {showCloseButton && (
            <button className="absolute -right-7 top-0" onClick={onClose}>
              <CloseIcon className="size-5" />
            </button>
          )}
          <div className="flex grow flex-col overflow-hidden overflow-y-auto rounded-xl scrollbar">
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default BaseModal;
