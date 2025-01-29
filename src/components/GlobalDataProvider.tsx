import { log } from '@src/constants';
import { useGlobalState } from '@src/store';
import { cleanupDbCache } from '@src/store/db';
import { showErrorToast } from '@src/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement, useEffect } from 'react';

// Time to wait in ms to check if the AO CU URL is congested
const CONGESTION_WINDOW = 5000;
const TWO_MINUTES = 120000;

const GlobalDataProvider = ({ children }: { children: ReactElement }) => {
  const setBlockHeight = useGlobalState((state) => state.setBlockHeight);
  const setCurrentEpoch = useGlobalState((state) => state.setCurrentEpoch);
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const setTicker = useGlobalState((state) => state.setTicker);
  const arweave = useGlobalState((state) => state.arweave);
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const setAoCongested = useGlobalState((state) => state.setAoCongested);
  const arioProcessId = useGlobalState((state) => state.arioProcessId);
  const aoCuUrl = useGlobalState((state) => state.aoCuUrl);
  const networkPortalDB = useGlobalState((state) => state.networkPortalDB);
  const queryClient = useQueryClient();

  useEffect(() => {
    const update = async () => {
      queryClient.resetQueries();

      // perform this first as retrieving the current epic takes some time
      const { Ticker } = await arioReadSDK.getInfo();
      setTicker(Ticker);

      try {
        const currentEpoch = await arioReadSDK.getCurrentEpoch();

        // FIXME: This is here to prevent the app from crashing when the current epoch comes back as an empty array.
        // This is due to how contract and SDK are currently handling the epoch data situation when it can't be fetched.
        // This should be removed when the above situation is changed to throw an exception.
        if (Array.isArray(currentEpoch)) {
          log.error('Error fetching current epoch');
          showErrorToast(
            'Error fetching current epoch. Application may not function as expected.',
          );
          return;
        }
        setCurrentEpoch(currentEpoch);
      } catch (error) {
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
    // Block Height Updater
    const updateBlockHeight = async () => {
      const blockHeight = await (await arweave.blocks.getCurrent()).height;
      setBlockHeight(blockHeight);
    };
    updateBlockHeight();
    const interval = setInterval(updateBlockHeight, TWO_MINUTES);

    // AO congestion checker: Checks CU URL every 30 seconds and if it takes longer than 5 seconds will
    // dispatch a warning to the user

    const checkAoCongestion = () => {
      const startTime = Date.now();
      fetch(`${aoCuUrl}/state/${arioProcessId}`, { method: 'HEAD' })
        .then((res) => {
          const endTime = Date.now();
          if (!res.ok) {
            log.error('AO CU URL is down');
            setAoCongested(true);
          } else {
            const congested = endTime - startTime > CONGESTION_WINDOW;
            setAoCongested(congested);
          }
        })
        .catch((error) => {
          log.error('AO CU URL is down', error);
          setAoCongested(true);
        });
    };

    checkAoCongestion();
    const congestionInterval = setInterval(checkAoCongestion, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(congestionInterval);
      setAoCongested(false);
    };
  }, [aoCuUrl, arioProcessId, arweave.blocks, setAoCongested, setBlockHeight]);

  return <>{children}</>;
};

export default GlobalDataProvider;
