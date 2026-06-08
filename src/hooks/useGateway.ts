import { GatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { isValidSolanaAddress } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

const useGateway = ({
  ownerWalletAddress,
}: {
  ownerWalletAddress?: string;
}) => {
  const arIOReadSDK = useGlobalState((state) => state.arIOReadSDK);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);

  const queryResults = useQuery({
    queryKey: ['gateway', ownerWalletAddress || '', solanaRpcUrl],
    queryFn: () => {
      if (ownerWalletAddress === undefined) {
        return Promise.reject(
          new Error('Error: Gateway owner wallet address is required'),
        );
      }

      if (!isValidSolanaAddress(ownerWalletAddress)) {
        return Promise.reject(
          new Error(
            `Error: Unable to find gateway. '${ownerWalletAddress}' is not a valid Solana wallet address.`,
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
                } as GatewayWithAddress)
              : null;
          });
      }
    },
    enabled: !!ownerWalletAddress && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });

  return queryResults;
};

export default useGateway;
