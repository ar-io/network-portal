import Placeholder from '@src/components/Placeholder';
import usePrescribedNames from '@src/hooks/usePrescribedNames';
import { useGlobalState } from '@src/store';

/**
 * The ArNS names observers are prescribed to resolve this epoch (the names whose
 * resolution is used to assess gateway health). Sourced from the live epoch via
 * `usePrescribedNames` → SDK `getPrescribedNames` (plaintext, from the
 * NameRegistry). Rendered as plain chips — the portal has no canonical
 * ArNS-name link target, so we avoid guessing a URL.
 */
const PrescribedNamesBar = () => {
  const currentEpoch = useGlobalState((state) => state.currentEpoch);
  const { data: prescribedNames, isLoading } = usePrescribedNames();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-grey-500 px-6 py-4 text-sm">
      <span className="text-low">
        ArNS names prescribed for observation
        {currentEpoch ? ` (epoch ${currentEpoch.epochIndex})` : ''}:
      </span>
      {isLoading ? (
        <Placeholder />
      ) : prescribedNames && prescribedNames.length > 0 ? (
        prescribedNames.map((name) => (
          <span
            key={name}
            className="rounded bg-grey-500 px-2 py-0.5 font-medium text-mid"
          >
            {name}
          </span>
        ))
      ) : (
        <span className="italic text-low">none</span>
      )}
    </div>
  );
};

export default PrescribedNamesBar;
