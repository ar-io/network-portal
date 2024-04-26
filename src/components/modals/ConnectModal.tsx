/* eslint-disable tailwindcss/classnames-order */

import { Dialog } from '@headlessui/react';
import Button from '../Button';
import { ArConnectIcon, CloseIcon, ConnectIcon } from '../icons';

const ConnectModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
          <div>
            <div className="flex grow justify-center pb-[16px]">
              <ConnectIcon className="size-[24px]" />
            </div>
            <h2 className="text-high pb-[16px] text-2xl">
              Connect Your Wallet
            </h2>
            <div className="flex grow justify-center pb-[32px]">
              <Button
                onClick={() => {}}
                active={true}
                icon={<ArConnectIcon className="size-[16px]" />}
                title="Connect with ArConnect"
                text="Connect with ArConnect"
              />
            </div>
            <div className="flex grow justify-center gap-[4px] text-sm">
              <div className="text-low">Don&apos;t have a wallet?</div>

              <a
                className="text-mid"
                href="https://ar.io/wallet"
                target="_blank"
                rel="noreferrer"
              >
                Get one here.
              </a>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConnectModal;
