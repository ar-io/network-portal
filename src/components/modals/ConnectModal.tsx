import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef } from 'react';

const ConnectModal = ({ onClose }: { onClose: () => void }) => {
  const { setVisible, visible } = useWalletModal();
  const { connected } = useWallet();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (!hasOpened.current) {
      hasOpened.current = true;
      setVisible(true);
    }
  }, [setVisible]);

  useEffect(() => {
    if (hasOpened.current && !visible) {
      onClose();
    }
  }, [visible, onClose]);

  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  return null;
};

export default ConnectModal;
