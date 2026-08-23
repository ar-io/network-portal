import { TokenSupplyData } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

export const tokenSupplyQueryKey = (solanaRpcUrl: string) => [
  'tokenSupply',
  solanaRpcUrl,
];

/**
 * One `getTokenSupply()` per endpoint, shared by every consumer.
 *
 * The call costs three account reads (ArioConfig, GatewaySettings, and the
 * protocol token account). `useProtocolBalance` used to make the same call
 * under its own query key, so the Dashboard header alone paid for it twice.
 * Pass a `select` to read a single field without forking the cache entry.
 */
const useTokenSupply = <TData = TokenSupplyData>(
  select?: (supply: TokenSupplyData) => TData,
) => {
  const arioReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: tokenSupplyQueryKey(solanaRpcUrl),
    queryFn: () => {
      if (!arioReadSDK) throw new Error('arIOReadSDK not initialized');
      return arioReadSDK.getTokenSupply();
    },
    select,
    enabled: !!arioReadSDK,
    // One hour rather than the `Infinity` this hook used to carry: the merged
    // consumers include `protocolBalance`, which moves as each epoch
    // distributes, and that hook was already on an hourly cadence.
    staleTime: 60 * 60 * 1000,
  });
  return res;
};

export default useTokenSupply;
