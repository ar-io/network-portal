import { AoEpochSettings } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

/** Use shouldFetch to optimize whether to fetch or not.  */
const useEpochSettings = () => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery<AoEpochSettings & { hasEpochZeroStarted: boolean }>({
    queryKey: ['epochSettings', arIOReadSDK],
    queryFn: async () => {
      if (!arIOReadSDK) {
        throw new Error('arIOReadSDK not available');
      }

      const settings = await arIOReadSDK.getEpochSettings();
      // temporary for testing
      // const epochZeroStartTimestamp = dayjs().add(14, 'day').valueOf();
      const epochZeroStartTimestamp = settings.epochZeroStartTimestamp;
      const hasEpochZeroStarted = dayjs().isAfter(new Date(epochZeroStartTimestamp));
      return {
        ...settings,
        epochZeroStartTimestamp,
        hasEpochZeroStarted,
      };
    },
    enabled: !!arIOReadSDK,
  });

  return queryResults;
};

export default useEpochSettings;
