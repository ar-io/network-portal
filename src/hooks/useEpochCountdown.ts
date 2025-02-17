import { useGlobalState } from '@src/store';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import useEpochSettings from './useEpochSettings';

const useEpochCountdown = () => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { data: epochSettings } = useEpochSettings();

  const [countdown, setCountdown] = useState<string>();

  useEffect(() => {
    if (currentEpoch || epochSettings) {
      const updateCountdown = () => {
        const now = dayjs();
        const end = dayjs(
          new Date(
            currentEpoch?.endTimestamp ??
              epochSettings?.epochZeroStartTimestamp ??
              0,
          ),
        );
        const diff = end.diff(now, 'seconds');

        if (diff <= 0) {
          setCountdown('Awaiting...');
        } else {
          const days = Math.floor(diff / 86400);
          const hours = Math.floor((diff % 86400) / 3600) % 24;
          const minutes = Math.floor((diff % 3600) / 60);
          setCountdown(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`);
        }
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000); // Update every minute

      return () => clearInterval(intervalId);
    } else {
      setCountdown(undefined);
    }
  }, [currentEpoch, epochSettings]);

  return countdown;
};

export default useEpochCountdown;
