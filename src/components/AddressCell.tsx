import { formatAddress, getBlockExplorerUrlForAddress } from '@src/utils';
import CopyButton from './CopyButton';
import Tooltip from './Tooltip';

export const AddressCell = ({ address }: { address: string }) => {
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
          message={<div className="text-high">{address}</div>}
          useMaxWidth={false}
        >
          {formatAddress(address)}
        </Tooltip>
      </a>
      <CopyButton textToCopy={address} />
    </div>
  );
};

export default AddressCell;
