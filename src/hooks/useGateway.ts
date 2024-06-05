import { ARWEAVE_TX_REGEX } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateway = ({
  ownerWalletAddress,
}: {
  ownerWalletAddress?: string;
}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['gateway', ownerWalletAddress || '', arIOReadSDK],
    queryFn: () => {
      if (ownerWalletAddress === undefined) {
        return Promise.reject(
          new Error('Error: Gateway owner wallet address is required'),
        );
      }

      if (!ARWEAVE_TX_REGEX.test(ownerWalletAddress)) {
        return Promise.reject(
          new Error(
            `Error: Unable to find gateway. '${ownerWalletAddress}' is not a valid Arweave wallet address.`,
          ),
        );
      }

      if (arIOReadSDK && ownerWalletAddress) {
        return arIOReadSDK.getGateway({ address: ownerWalletAddress });
      }
    },
  });

  return queryResults;
};

export default useGateway;
