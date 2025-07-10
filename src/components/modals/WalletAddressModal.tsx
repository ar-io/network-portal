import { isValidAoAddress } from '@src/utils';
import { useMemo, useState } from 'react';
import Button, { ButtonType } from '../Button';
import BaseModal from './BaseModal';

export type WalletAddressModalProps = {
  onClose: () => void;
  onSuccess: (walletAddress: string) => void;
};

const WalletAddressModal = ({
  onClose,
  onSuccess,
}: WalletAddressModalProps) => {
  const [walletAddress, setWalletAddress] = useState('');

  const isValidAddress = useMemo(() => {
    return isValidAoAddress(walletAddress);
  }, [walletAddress]);

  return (
    <BaseModal
      onClose={onClose}
      showCloseButton={true}
      useDefaultPadding={false}
    >
      <div className="w-[28.4375rem] text-left">
        <div className="px-8  pb-4 pt-6">
          <div className="text-lg text-high">Enter Wallet Address</div>
        </div>

        <div className="flex flex-col gap-1 px-8"></div>

        <div className="mb-6 flex flex-col items-center gap-2 px-8 text-sm text-mid">
          <div className="self-start text-xs">Wallet Address:</div>
          <input
            type="text"
            onChange={(e) => setWalletAddress(e.target.value)}
            className={
              'h-7 w-full rounded-md border border-grey-700 bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
            }
            value={walletAddress}
          />
          {!isValidAddress && walletAddress.length > 0 && (
            <div className="text-xs text-red-500">Invalid wallet address</div>
          )}
        </div>

        <div className="bg-containerL0 px-8 py-4">
          <div className="flex grow justify-center">
            <Button
              onClick={() => onSuccess(walletAddress)}
              buttonType={ButtonType.PRIMARY}
              title="Submit"
              text={<div className="py-2">Submit</div>}
              className={`w-full ${!isValidAddress && 'pointer-events-none opacity-30'}`}
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default WalletAddressModal;
