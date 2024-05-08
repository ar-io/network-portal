import * as Tooltip from '@radix-ui/react-tooltip';
import { FormErrorIcon } from '../icons';

export enum RowType {
  TOP,
  MIDDLE,
  BOTTOM,
  SINGLE,
}

const FormRow = ({
  formPropertyName,
  formState,
  placeholder,
  enabled = true,
  setFormState,
  errorMessages,
  setErrorMessages,
  label,
  rowType = RowType.MIDDLE,
  leftComponent,
  rightComponent,
  validateProperty,
}: {
  formPropertyName: string;
  placeholder?: string;
  enabled?: boolean;
  formState: Record<string, string>;
  setFormState: (formState: Record<string, string>) => void;
  errorMessages: Record<string, string>;
  setErrorMessages: (errorMessages: Record<string, string>) => void;
  label: string;
  rowType?: RowType;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  validateProperty: (value: string) => string | undefined;
}) => {
  const roundStyle =
    rowType === RowType.TOP
      ? 'rounded-t-md'
      : rowType === RowType.BOTTOM
        ? 'rounded-b-md'
        : rowType === RowType.SINGLE
          ? 'rounded-md'
          : '';

  const errorMessage = errorMessages[formPropertyName];
  const hasError = enabled && errorMessage?.trim().length > 0;

  return (
    <>
      <div className="bg-grey-900 pb-px">
        <div className="h-[39px] bg-grey-1000 px-[24px] py-[12px] text-xs text-low">
          {label}
        </div>
      </div>
      <div>
        <div
          className={[
            'h-[40px] overflow-hidden from-gradient-primary-start to-gradient-primary-end p-px focus-within:bg-gradient-to-r',
            hasError
              ? 'bg-red-600'
              : 'bg-grey-800 focus-within:p-px',
            roundStyle,
          ].join(' ')}
        >
          <div
            className={`flex h-[38px] items-center gap-[3px] overflow-hidden bg-grey-1000 ${roundStyle}`}
          >
            {leftComponent}
            <input
              className={
                'size-full overflow-hidden border-none bg-grey-1000 px-[24px] py-[12px] text-sm text-mid outline-none placeholder:text-grey-600 focus:text-high'
              }
              type="text"
              contentEditable={enabled}
              readOnly={!enabled}
              placeholder={placeholder}
              value={enabled ? formState[formPropertyName] : ''}
              onChange={(e) => {
                if (hasError) {
                  const cleared = { ...errorMessages };
                  delete cleared[formPropertyName];
                  setErrorMessages(cleared);
                }
                setFormState({
                  ...formState,
                  [formPropertyName]: e.target.value,
                });
              }}
              onBlur={() => {
                const errMessage = validateProperty(
                  formState[formPropertyName],
                );
                if (errMessage) {
                  setErrorMessages({
                    ...errorMessages,
                    [formPropertyName]: errMessage,
                  });
                } else {
                  const cleared = { ...errorMessages };
                  delete cleared[formPropertyName];
                  setErrorMessages(cleared);
                }
              }}
            />
            {hasError && (
              <div className="relative flex px-[12px] text-red-600">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger>
                      <FormErrorIcon />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="z-50 w-fit rounded-md bg-red-1000 px-[24px] py-[12px]">
                        <Tooltip.Arrow className="fill-red-1000" />
                        <div className="text-sm text-red-600">
                          {errorMessage}
                        </div>
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
            )}
            {rightComponent}
          </div>
        </div>
      </div>
    </>
  );
};

export default FormRow;
