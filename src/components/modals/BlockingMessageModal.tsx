import { ArioLogoIcon } from '../icons';
import BaseModal from './BaseModal';

/**
 * The wallet round-trip cover.
 *
 * The mark is `ario.svg` — the same asset the rest of the app uses — rather
 * than the Lottie this used to play, which drew an older logo, rendered it
 * small and off-centre, and cost 371KB of JSON plus the `lottie-react`
 * dependency for the one animation in the product.
 */
const BlockingMessageModal = ({
  onClose,
  message,
}: {
  onClose: () => void;
  message: string;
}) => {
  return (
    <BaseModal onClose={onClose} showCloseButton={false}>
      <div className="flex max-w-[calc(100vw-2rem)] flex-col items-center justify-center lg:w-[24.5rem]">
        <div
          className="relative mb-4 flex size-[4.5rem] items-center justify-center"
          role="status"
          aria-label="Waiting for your wallet"
        >
          {/* Two arcs of the brand gradient rotating around a still mark: the
              logo is asymmetric, so spinning it reads as tumbling. */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-gradient-primary-end border-t-gradient-primary-start" />
          <ArioLogoIcon className="size-9" />
        </div>
        <div className="text-sm text-mid">{message}</div>
      </div>
    </BaseModal>
  );
};

export default BlockingMessageModal;
