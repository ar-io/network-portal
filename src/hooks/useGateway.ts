import { AoGatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { isValidAoAddress } from '@src/utils';
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

      if (!isValidAoAddress(ownerWalletAddress)) {
        return Promise.reject(
          new Error(
            `Error: Unable to find gateway. '${ownerWalletAddress}' is not a valid AO wallet address.`,
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
    enabled: !!ownerWalletAddress && !!arIOReadSDK,
  });

  return queryResults;
};

export default useGateway;
