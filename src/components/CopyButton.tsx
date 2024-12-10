import { MouseEvent, useState } from 'react';
import { CopyCheckedIcon, CopyIcon } from './icons';

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copiedVisible, setCopiedVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<any>();

  const copyAction = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCopiedVisible(true);
    navigator.clipboard.writeText(textToCopy);

    clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      setCopiedVisible(false);
    }, 1000);
    setTimeoutId(newTimeoutId);
  };

  return (
    <div className="relative">
      <div
        className={`${copiedVisible ? 'visible' : 'invisible'} absolute -left-7 -top-12 z-50 rounded-lg border border-grey-500 bg-containerL0 p-2`}
      >
        Copied!
        <div
          className={`absolute bottom-[-.3125rem] left-[1.875rem] size-2.5 rotate-45 border border-grey-500 bg-containerL0 [clip-path:polygon(0%_100%,100%_0,100%_100%)]`}
        />
      </div>
      <button onClick={copyAction}>
        {copiedVisible ? (
          <CopyCheckedIcon className="size-4 opacity-65" />
        ) : (
          <CopyIcon className="size-4 opacity-65" />
        )}
      </button>
    </div>
  );
};

export default CopyButton;
