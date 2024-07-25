import * as Tooltip from '@radix-ui/react-tooltip';
import { FormErrorIcon } from '../icons';

const ErrorMessageIcon = ({
  errorMessage,
  tooltipPadding,
}: {
  errorMessage: string;
  tooltipPadding?: string;
}) => {
  const marginBottom = tooltipPadding ? `mb-${tooltipPadding}` : '';

  return (
    <div className="relative flex px-3 text-red-600">
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={0}>
          <Tooltip.Trigger>
            <FormErrorIcon className="size-[1.125rem]" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="z-50 w-fit max-w-[25rem] rounded-md bg-red-1000 px-6 py-3">
              <Tooltip.Arrow className={`fill-red-1000 ${marginBottom}`} />
              <div className="text-sm text-red-600">{errorMessage}</div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};

export default ErrorMessageIcon;
