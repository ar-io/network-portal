import * as Tooltip from '@radix-ui/react-tooltip';
import { FormErrorIcon } from '../icons';

const ErrorMessageIcon = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <div className="relative flex px-[12px] text-red-600">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <FormErrorIcon />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="z-50 w-fit max-w-[400px] rounded-md bg-red-1000 px-[24px] py-[12px]">
              <Tooltip.Arrow className="fill-red-1000" />
              <div className="text-sm text-red-600">{errorMessage}</div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};

export default ErrorMessageIcon;
