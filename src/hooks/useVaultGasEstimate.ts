import {
  estimateGasFee,
  estimateRentLamports,
  getVaultCounterPDA,
} from '@ar.io/sdk/solana';
import type { GasEstimate } from '@ar.io/sdk/web';
import { address, fetchEncodedAccount } from '@solana/kit';
import { useGlobalState, useSettings } from '@src/store';
import { getOptionalSolanaAddress } from '@src/utils/solanaAddress';
import { useQuery } from '@tanstack/react-query';

/**
 * Byte sizes of the accounts a locked transfer creates. Measured against live
 * devnet accounts rather than derived from the struct: the codegen `Vault`
 * encoder is variable-size (`Option<Address>` controller) while Anchor
 * allocates a fixed 110, so summing the fields under-counts.
 */
const VAULT_ACCOUNT_BYTES = 110;
const VAULT_COUNTER_ACCOUNT_BYTES = 52;
/** SPL token account — the vault's ATA, always fresh for a new vault PDA. */
const TOKEN_ACCOUNT_BYTES = 165;

/**
 * Quote the SOL cost of a locked transfer.
 *
 * There is no SDK estimator for this flow — `getGasEstimate` takes an ArNS
 * `Intent` and `getGarGasEstimate` a `GarGasWorkflow`, and a vaulted transfer
 * is neither — so this composes the same two primitives those use.
 *
 * The rent matters more than the fee here: a plain transfer costs fees only,
 * while a locked transfer deposits rent for a Vault PDA and the vault's token
 * account, plus the recipient's vault counter if this is their first vault
 * ever. That is roughly two orders of magnitude more SOL, and a user who has
 * only ever done plain sends will not expect it.
 */
const useVaultGasEstimate = ({ recipient }: { recipient?: string }) => {
  const rpc = useGlobalState((state) => state.rpc);
  const solanaRpcUrl = useGlobalState((state) => state.solanaRpcUrl);
  const coreProgramId = useSettings((state) => state.solanaCoreProgramId);

  const validRecipient = getOptionalSolanaAddress(recipient);
  const validCoreProgram = getOptionalSolanaAddress(coreProgramId);

  return useQuery<GasEstimate>({
    queryKey: ['vaultGasEstimate', validRecipient, solanaRpcUrl, coreProgramId],
    queryFn: async () => {
      if (!rpc || !validRecipient || !validCoreProgram) {
        throw new Error('Missing rpc, recipient, or core program id');
      }

      const accountBytes = [VAULT_ACCOUNT_BYTES, TOKEN_ACCOUNT_BYTES];

      // The counter is created on the recipient's first-ever vault. Treat an
      // RPC failure as "already exists" rather than failing the quote: the
      // estimate is advisory, and the modal still renders the fee rows.
      try {
        const [counterPda] = await getVaultCounterPDA(
          address(validRecipient),
          address(validCoreProgram),
        );
        const counter = await fetchEncodedAccount(rpc, counterPda);
        if (!counter.exists) {
          accountBytes.push(VAULT_COUNTER_ACCOUNT_BYTES);
        }
      } catch {
        // Leave the counter out of the quote.
      }

      const rentLamports = await estimateRentLamports(rpc, accountBytes);

      // `vaultedTransfer` sends one transaction with one signature and does not
      // pass a compute-unit limit, so it takes the SDK's 400k default.
      return estimateGasFee(rpc, { rentLamports });
    },
    staleTime: 60 * 1000,
    enabled: !!rpc && !!validRecipient && !!validCoreProgram,
  });
};

export default useVaultGasEstimate;
