import { ARIOToken } from '@ar.io/sdk/web';
import { WRITE_OPTIONS } from '@src/constants';
import useBalances from '@src/hooks/useBalances';
import { useGlobalState } from '@src/store';
import { isValidAoAddress } from '@src/utils';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from '../Button';
import { LinkArrowIcon } from '../icons';
import BaseModal from './BaseModal';
import BlockingMessageModal from './BlockingMessageModal';
import SuccessModal from './SuccessModal';

const TransferArioModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const ticker = useGlobalState((state) => state.ticker);
  const walletAddress = useGlobalState((state) => state.walletAddress);
  const { data: balances } = useBalances(walletAddress);
  const arIOWriteableSDK = useGlobalState((state) => state.arIOWriteableSDK);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientError, setRecipientError] = useState<string>();
  const [amountError, setAmountError] = useState<string>();
  const [formValid, setFormValid] = useState(false);

  const transferArio = async (recipient: string, amount: string) => {
    if (arIOWriteableSDK === undefined) {
      return;
    }

    setShowBlockingMessageModal(true);
    try {
      const mArio = new ARIOToken(+amount).toMARIO();
      const { id: txID } = await arIOWriteableSDK.transfer(
        {
          target: recipient,
          qty: mArio,
        },
        WRITE_OPTIONS,
      );

      setTxid(txID);

      queryClient.invalidateQueries({
        queryKey: ['balances'],
        refetchType: 'all',
      });

      setShowSuccessModal(true);
    } catch (e: any) {
      showErrorToast(`${e}`);
    } finally {
      setShowBlockingMessageModal(false);
    }
  };

  const [showBlockingMessageModal, setShowBlockingMessageModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [txid, setTxid] = useState<string>();

  useEffect(() => {
    const arioBalance = balances?.ario ?? 0;
    const hasRecipientError =
      !isValidAoAddress(recipient) && recipient.length > 0;
    const hasAmountError = isNaN(+amount) || +amount > arioBalance;
    setRecipientError(hasRecipientError ? 'Invalid address' : undefined);
    setAmountError(
      isNaN(+amount)
        ? 'Invalid amount'
        : +amount > arioBalance
          ? 'Insufficient funds.'
          : undefined,
    );

    setFormValid(
      !hasRecipientError &&
        !hasAmountError &&
        recipient.length > 0 &&
        +amount > 0,
    );
  }, [amount, balances, balances?.ario, recipient]);

  return (
    <BaseModal onClose={onClose} useDefaultPadding={false}>
      <div className="w-[calc(100vw-2rem)] text-left lg:w-[28.4375rem]">
        <div className="flex w-full flex-col px-8 pb-4 pt-6">
          <div className="text-lg text-high">Send {ticker}</div>

          <div className="my-8 grow overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex flex-col gap-2">
              <div className="grow">Recipient</div>
              <input
                type="text"
                onChange={(e) => setRecipient(e.target.value)}
                className={`h-7 w-full rounded-md border ${recipientError ? 'border-red-600' : 'border-grey-700'} bg-grey-1000 px-4 py-6 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high`}
                placeholder="Enter Arweave or ETH Wallet Address"
                value={recipient}
              />
            </div>
            {recipientError && (
              <div className="p-2 text-xs text-red-600">{recipientError}</div>
            )}
          </div>

          <div className="my-2 grow overflow-y-auto text-sm text-mid scrollbar">
            <div className="flex flex-col gap-2">
              <div className="flex grow items-center">
                <div className="grow">Amount</div>
                <div className="text-xs text-low">
                  Balance: {balances?.ario ?? 0}
                </div>
              </div>
              <div
                className={`flex rounded-md border ${amountError ? ' border-red-600' : 'border-grey-700'} py-2`}
              >
                <input
                  type="text"
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  className={
                    'h-7 w-full grow bg-grey-1000 p-4 text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
                  }
                  value={amount}
                />
                <Button
                  className="mr-3 h-7"
                  onClick={() => setAmount(String(balances?.ario))}
                  buttonType={ButtonType.SECONDARY}
                  active={true}
                  title="Max"
                  text="Max"
                />
              </div>
            </div>
            {amountError && (
              <div className="p-2 text-xs text-red-600">{amountError}</div>
            )}
          </div>
        </div>

        <div className="my-8 flex grow justify-center px-8">
          <Button
            onClick={() => transferArio(recipient, amount)}
            buttonType={ButtonType.PRIMARY}
            title="Send"
            text={<div className="py-2">Send</div>}
            className={`w-full ${!formValid && 'pointer-events-none opacity-30'}`}
          />
        </div>

        {showBlockingMessageModal && (
          <BlockingMessageModal
            onClose={() => setShowBlockingMessageModal(false)}
            message="Sign the following data with your wallet to proceed."
          ></BlockingMessageModal>
        )}
        {showSuccessModal && (
          <SuccessModal
            onClose={() => {
              setShowSuccessModal(false);
              onClose();
            }}
            title="Confirmed"
            // FIXME: This uses a button as using a standard <a> tag does not work. Needs further investigation.
            bodyText={
              <div className="mb-8 text-sm text-mid">
                <div>
                  You have successfully sent {amount} {ticker}.
                </div>
                <div className="my-2 flex flex-col justify-center gap-2">
                  <div>Transaction ID:</div>
                  <button
                    className="flex items-center justify-center break-all"
                    title="View transaction on AR.IO Scan"
                    onClick={async () => {
                      window.open(
                        `https://scan.ar.io/#/message/${txid}`,
                        '_blank',
                      );
                    }}
                  >
                    {txid}
                    <LinkArrowIcon className="ml-1 size-3" />
                  </button>
                </div>
              </div>
            }
          />
        )}
      </div>
    </BaseModal>
  );
};

export default TransferArioModal;
