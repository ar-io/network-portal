import usePrimaryName from '@src/hooks/usePrimaryName';
import {
  formatAddress,
  formatPrimaryName,
  getBlockExplorerUrlForAddress,
} from '@src/utils';
import CopyButton from './CopyButton';
import Tooltip from './Tooltip';

interface AddressCellWithNameProps {
  address: string;
  useBatchedNames?: boolean;
  primaryNameOverride?: string | null;
}

export const AddressCellWithName = ({
  address,
  useBatchedNames = false,
  primaryNameOverride,
}: AddressCellWithNameProps) => {
  // Use individual hook if not using batched names
  const { data: primaryName } = usePrimaryName(
    !useBatchedNames ? address : undefined,
  );

  // Determine which primary name to use
  const displayName = useBatchedNames ? primaryNameOverride : primaryName?.name;

  return (
    <div className="flex gap-2 align-middle text-mid">
      <a
        href={getBlockExplorerUrlForAddress(address)}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Tooltip
          message={
            <div className="text-high">
              {displayName && (
                <>
                  <div className="font-semibold">{displayName}</div>
                  <div className="text-xs opacity-75">{address}</div>
                </>
              )}
              {!displayName && address}
            </div>
          }
          useMaxWidth={false}
        >
          {displayName
            ? formatPrimaryName(displayName)
            : formatAddress(address)}
        </Tooltip>
      </a>
      <CopyButton textToCopy={address} />
    </div>
  );
};

export default AddressCellWithName;
