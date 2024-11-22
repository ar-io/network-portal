import { ARWEAVE_TX_REGEX, AoGatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { useQuery } from '@tanstack/react-query';

const useGateway = ({
  ownerWalletAddress,
}: {
  ownerWalletAddress?: string;
}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);

  const queryResults = useQuery({
    queryKey: ['gateway', arIOReadSDK, ownerWalletAddress || ''],
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

      if (arIOReadSDK) {
        return arIOReadSDK
          .getGateway({ address: ownerWalletAddress })
          .then((gateway) => {
            return gateway
              ? ({
                  ...gateway,
                  gatewayAddress: ownerWalletAddress,
                } as AoGatewayWithAddress)
              : undefined;
          });
      } 
    },
  });

  return queryResults;
};

export default useGateway;
