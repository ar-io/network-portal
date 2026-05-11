import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { cleanupDbCache } from '@src/store/db';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement, useEffect } from 'react';

const TWO_MINUTES = 120000;

const GlobalDataProvider = ({ children }: { children: ReactElement }) => {
  const setSolanaSlot = useGlobalState((state) => state.setSolanaSlot);
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const setTicker = useGlobalState((state) => state.setTicker);
  const rpc = useGlobalState((state) => state.rpc);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setIsMobile = useGlobalState((state) => state.setIsMobile);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const queryClient = useQueryClient();

  useEffect(() => {
    const update = async () => {
      await queryClient.cancelQueries();
      await queryClient.resetQueries();

      const { Ticker } = await arioReadSDK.getInfo();
      setTicker(Ticker);

      try {
        const currentEpoch = await arioReadSDK.getCurrentEpoch();

        if (Array.isArray(currentEpoch)) {
          log.error('Error fetching current epoch');
          showErrorToast(
            'Error fetching current epoch. Application may not function as expected.',
          );
          return;
        }
        setCurrentEpoch(currentEpoch);
      } catch (_error) {
        log.error('Error fetching current epoch');
        showErrorToast(
          'Error fetching current epoch. Application may not function as expected.',
        );
      }
    };

    update();
  }, [arioReadSDK, queryClient, setCurrentEpoch, setTicker]);

  useEffect(() => {
    if (currentEpoch?.epochIndex && networkPortalDB) {
      cleanupDbCache(networkPortalDB, currentEpoch.epochIndex);
    }
  }, [currentEpoch, networkPortalDB]);

  useEffect(() => {
    const updateSlot = async () => {
      try {
        const slot = await rpc.getSlot().send();
        setSolanaSlot(Number(slot));
      } catch (error) {
        log.error('Error fetching Solana slot', error);
      }
    };
    updateSlot();
    const interval = setInterval(updateSlot, TWO_MINUTES);

    return () => {
      clearInterval(interval);
    };
  }, [rpc, setSolanaSlot]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return <>{children}</>;
};

export default GlobalDataProvider;
