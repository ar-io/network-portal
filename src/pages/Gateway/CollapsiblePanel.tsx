import { CirclePlus, Minus } from 'lucide-react';
import { useState } from 'react';

type CollapsiblePanelProps = {
  title: React.ReactNode;
  titleRight?: React.ReactNode;
  children?: React.ReactNode;
};

const CollapsiblePanel = ({
  title,
  children,
  titleRight,
}: CollapsiblePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-xl border border-transparent-100-16 text-sm">
      <div
        className={`flex items-center gap-2 border-b border-grey-500 bg-containerL3 px-6 py-4 ${isOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
      >
        {children && (
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <Minus className="size-5" />
            ) : (
              <CirclePlus className="size-5" />
            )}
          </button>
        )}
        <div className="grow items-center whitespace-nowrap text-high">
          {title}
        </div>
        {titleRight}
      </div>

      {isOpen && children}
    </div>
  );
};

export default CollapsiblePanel;
