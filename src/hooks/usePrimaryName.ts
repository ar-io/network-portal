import { PrimaryName } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import {
  fetchPortalDocument,
  networkTierFromRpcUrl,
} from '@src/utils/portalApi';
import { useQuery } from '@tanstack/react-query';

const usePrimaryName = (walletAddress?: string) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const res = useQuery({
    queryKey: ['primaryName', walletAddress, solanaRpcUrl],
    queryFn: async () => {
      if (!walletAddress || !arIOReadSDK) {
        throw new Error('Wallet Address or SDK not available');
      }

      const owner = walletAddress.toString();

      // `getPrimaryName` is an UNFILTERED whole-program scan: it deserializes
      // every primary-name account and filters client-side, so resolving one
      // wallet's name swept the entire set. The snapshot publishes those rows
      // verbatim, so a local find is equivalent.
      // The publisher stores the SDK's decoded shape verbatim, so a row here
      // IS a PrimaryName — same fields the RPC path returns.
      const snapshot = await fetchPortalDocument<PrimaryName>(
        'primaryNames',
        networkTierFromRpcUrl(solanaRpcUrl),
      );

      if (snapshot) {
        // A wallet with no primary name is a legitimate null, the same answer
        // the catch below produces — not a snapshot miss to retry via RPC.
        return snapshot.find((entry) => entry.owner === owner) ?? null;
      }

      try {
        const primaryName = await arIOReadSDK.getPrimaryName({
          address: owner,
        });
        return primaryName;
      } catch (_e) {
        // getPrimaryName throws exception if a name is not set for a wallet
        // catch and return null to prevent retrying
        return null;
      }
    },
    enabled: !!walletAddress && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });

  return res;
};

export default usePrimaryName;
