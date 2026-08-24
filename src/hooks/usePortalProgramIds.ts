import { useSettings } from '@src/store';
import type { PortalProgramIds } from '@src/utils/portalApi';
import { useMemo } from 'react';

/**
 * The Solana program ids this app is currently configured with, in the shape
 * the publisher stamps on every document (schema >= 1.2).
 *
 * `fetchPortalDocument` compares these against the snapshot's and refuses a
 * mismatch: program ids are per-cluster and a redeploy moves them, and
 * decoding accounts from the wrong program yields plausible nonsense rather
 * than an error. Without this the published `programIds` field is documentation
 * rather than protection.
 *
 * These are read from `useSettings` rather than `constants` so a program id
 * overridden in the Settings panel is what gets compared.
 */
export const usePortalProgramIds = (): PortalProgramIds => {
  const core = useSettings((state) => state.solanaCoreProgramId);
  const gar = useSettings((state) => state.solanaGarProgramId);
  const arns = useSettings((state) => state.solanaArnsProgramId);
  const ant = useSettings((state) => state.solanaAntProgramId);

  return useMemo(() => ({ core, gar, arns, ant }), [core, gar, arns, ant]);
};

export default usePortalProgramIds;
