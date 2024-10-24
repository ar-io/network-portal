import { useGlobalState } from '@src/store';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const useEpochCountdown = () => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);

  const [countdown, setCountdown] = useState<string>();

  useEffect(() => {
    if (currentEpoch) {
      const updateCountdown = () => {
        const now = dayjs();
        const end = dayjs(new Date(currentEpoch.endTimestamp));
        const diff = end.diff(now, 'seconds');

        if (diff <= 0) {
          setCountdown('0h 0m');
        } else {
          const hours = Math.floor(diff / 3600);
          const minutes = Math.floor(diff % 3600 / 60);
          setCountdown(`${hours}h ${minutes}m`);
        }
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000); // Update every minute

      return () => clearInterval(intervalId);
    } else {
      setCountdown(undefined);
    }
  }, [currentEpoch]);

  return countdown;
};

export default useEpochCountdown;
