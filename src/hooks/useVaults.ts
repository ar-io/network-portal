import { useVaultsQuery } from './useVaultsQuery';

/** Every vault, unaggregated. A view over the shared vaults query. */
const useVaults = () => useVaultsQuery();

export default useVaults;
