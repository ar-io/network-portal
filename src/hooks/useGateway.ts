import { GatewayWithAddress } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/store';
import { isValidSolanaAddress } from '@src/utils';
import { useQuery } from '@tanstack/react-query';

/**
 * Whether a failed `getGateway` means the gateway does not exist, as opposed
 * to the read having failed.
 */
const isGatewayNotFound = (error: unknown): boolean =>
  error instanceof Error && /gateway not found/i.test(error.message);

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
          })
          .catch((error: unknown) => {
            // `null` means the registry has no such gateway; a rejection means
            // the read failed. The SDK does not make that distinction for us —
            // `getGateway` throws for a missing account rather than returning
            // nothing (io-readable.ts: `if (!account.exists) throw`), so the
            // `: null` branch above is unreachable and every departed gateway
            // looked like a failed read.
            //
            // Callers need the difference: one is "this gateway has left", the
            // other is "we could not find out". Matched on the SDK's own
            // message, deliberately narrowly — anything else still propagates
            // and surfaces as an error.
            if (isGatewayNotFound(error)) {
              return null;
            }
            throw error;
          });
      }
    },
    enabled: !!ownerWalletAddress && !!arIOReadSDK,
    staleTime: 5 * 60 * 1000,
  });

  return queryResults;
};

export default useGateway;
