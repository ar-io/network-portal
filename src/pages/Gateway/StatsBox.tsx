import { StatsArrowIcon } from '@src/components/icons';
import Placeholder from '@src/components/Placeholder';
import { ReactNode } from 'react';

const ValueRow = ({ value }: { value: string | number | undefined }) => {
  return (
    <div className="flex gap-1">
      <StatsArrowIcon className="size-4" />
      {value !== undefined ? (
        <div className="break-all text-sm text-mid">{value}</div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

const StatsBox = ({
  title,
  value,
}: {
  title: string | ReactNode;
  value: Array<string> | string | number | undefined;
}) => {
  return (
    <div className="flex flex-col gap-1 border-t border-transparent-100-16 px-6 py-4">
      <div className="text-xs text-low">{title}</div>
      {value instanceof Array ? (
        value.map((v, i) => <ValueRow value={v} key={i} />)
      ) : (
        <ValueRow value={value} />
      )}
    </div>
  );
};

export default StatsBox;
