import useTokenSupply from './useTokenSupply';

/**
 * The protocol reward reserve, in mARIO.
 *
 * This is one field of the token-supply read. It used to issue its own
 * `getTokenSupply()` under a separate query key, which meant three redundant
 * account reads on any page showing both this and the supply breakdown — the
 * Dashboard shows both. Selecting off the shared query collapses them into one
 * fetch.
 */
const useProtocolBalance = () =>
  useTokenSupply((supply) => supply.protocolBalance);

export default useProtocolBalance;
