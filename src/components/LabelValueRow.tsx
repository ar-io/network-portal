import { ReactNode } from 'react';

const LabelValueRow = ({
  label,
  value,
  className,
  isLink = false,
  rightIcon,
}: {
  label: string;
  value: ReactNode;
  isLink?: boolean;
  className?: string;
  rightIcon?: React.ReactNode;
}) => {
  return (
    <div className={`flex items-center text-[0.8125rem] ${className}`}>
      <div className="text-left text-low">{label}</div>
      <div className="grow"></div>
      {isLink && value !== '-' ? (
        <a
          className="text-gradient"
          href={`https://${value}`}
          target="_blank"
          rel="noreferrer"
        >
          {value}
        </a>
      ) : (
        <div className="flex items-center gap-1 text-left text-low">
          {value}
          {rightIcon}
        </div>
      )}
    </div>
  );
};

export default LabelValueRow;
