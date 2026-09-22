/**
 * What a panel shows when the read behind it has failed.
 *
 * A skeleton is a promise that something is arriving. Once a read has failed
 * nothing is arriving, and leaving the shimmer in place reads as a permanently
 * loading page rather than a broken one — the failure mode CLAUDE.md calls out
 * for an unset mainnet endpoint.
 *
 * The distinction is not always visible in a hook's `isError`: a query gated on
 * `currentEpoch` is disabled rather than failed when the epoch never arrives,
 * so it stays pending forever and never errors. Panels downstream of the epoch
 * branch on `epochLoadFailed` from global state instead.
 */
const PanelUnavailable = ({ children }: { children: React.ReactNode }) => (
  <div className="flex size-full">
    <div className="m-auto px-6 text-center text-sm text-low">{children}</div>
  </div>
);

export default PanelUnavailable;
