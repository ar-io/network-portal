import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef } from 'react';

const ConnectModal = ({ onClose }: { onClose: () => void }) => {
  const { setVisible, visible } = useWalletModal();
  const { connected } = useWallet();
  const hasOpened = useRef(false);
  const wasVisible = useRef(false);
  const hasClosed = useRef(false);

  useEffect(() => {
    if (!hasOpened.current) {
      hasOpened.current = true;
      setVisible(true);
    }
  }, [setVisible]);

  useEffect(() => {
    if (visible) {
      hasOpened.current = true;
    }

    if (
      !hasClosed.current &&
      hasOpened.current &&
      wasVisible.current &&
      !visible
    ) {
      hasClosed.current = true;
      onClose();
    }

    wasVisible.current = visible;
  }, [visible, onClose]);

  useEffect(() => {
    if (!hasClosed.current && connected) {
      hasClosed.current = true;
      onClose();
    }
  }, [connected, onClose]);

  return null;
};

export default ConnectModal;
