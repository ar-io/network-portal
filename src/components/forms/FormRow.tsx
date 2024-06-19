import { ResetIcon } from '../icons';
import ErrorMessageIcon from './ErrorMessageIcon';
import FormSwitch from './FormSwitch';

export enum RowType {
  TOP,
  MIDDLE,
  BOTTOM,
  SINGLE,
  LAST, // special hack for last row due to rounding of container vs form
}

const ROUND_STYLES = {
  [RowType.TOP]: 'rounded-t-md',
  [RowType.BOTTOM]: 'rounded-b-md',
  [RowType.SINGLE]: 'rounded-md',
  [RowType.MIDDLE]: '',
  [RowType.LAST]: 'rounded-bl-md rounded-br-xl',
};

const ModifiedDot = ({ className }: { className: string }) => (
  <div className={`size-[15px] ${className}`}>
    <div className={`absolute size-[15px] rounded-[10px] bg-green-600/20`} />
    <div
      className={`absolute left-[5px] top-[5px] size-[5px] rounded-[10px]  bg-green-600`}
    />
  </div>
);

const FormRow = ({
  formPropertyName,
  initialState,
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
  readOnly,
  showModified = true,
}: {
  formPropertyName: string;
  placeholder?: string;
  enabled?: boolean;
  initialState?: Record<string, string | boolean>;
  formState: Record<string, string | boolean>;
  setFormState: (formState: Record<string, string | boolean>) => void;
  errorMessages: Record<string, string>;
  setErrorMessages: (errorMessages: Record<string, string>) => void;
  label: string;
  rowType?: RowType;
  leftComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  validateProperty?: (value: string) => string | undefined;
  readOnly?: boolean;
  showModified?: boolean;
}) => {
  const roundStyle = ROUND_STYLES[rowType];

  const errorMessage = errorMessages[formPropertyName];
  const hasError = enabled && errorMessage?.trim().length > 0;

  const value = formState[formPropertyName];

  const modified =
    showModified && initialState && initialState[formPropertyName] !== value;

  const clearFormError = () => {
    const cleared = { ...errorMessages };
    delete cleared[formPropertyName];
    setErrorMessages(cleared);
  };

  const resetFormValue = () => {
    if (initialState) {
      setFormState({
        ...formState,
        [formPropertyName]: initialState[formPropertyName],
      });
      clearFormError();
    }
  };

  return (
    <>
      <div className="bg-grey-900 pb-px">
        <div className="h-[39px] bg-grey-1000 px-[24px] py-[12px] text-xs text-low">
          {label}
        </div>
      </div>
      {readOnly ? (
        <div className="h-[40px] content-center border-b border-grey-800 px-[24px] text-sm text-low">
          {value}
        </div>
      ) : typeof value === 'boolean' ? (
        <div className="relative flex content-center items-center border-b border-grey-800 px-[24px] ">
          <div className="h-[40px] grow content-center text-sm">
            <span className={value ? 'text-green-600' : 'text-low'}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <FormSwitch
            checked={value}
            onChange={(v) => {
              setFormState({
                ...formState,
                [formPropertyName]: v,
              });
            }}
            title={`${value ? 'Disable' : 'Enable'} ${label}`}
          />

          {modified && (
            // using fixed position to avoid the modified dot from being clipped by the overflow-hidden parent
            // may need to revisit if form parent placement changes to not be flush right with viewport
            <ModifiedDot className="fixed right-[17.5px] z-10" />
          )}
        </div>
      ) : (
        <div
          className={[
            'relative h-[40px] overflow-hidden from-gradient-primary-start to-gradient-primary-end p-px focus-within:bg-gradient-to-r',
            hasError ? 'bg-red-600' : 'bg-grey-800 focus-within:p-px',
            roundStyle,
          ].join(' ')}
        >
          <div
            className={`flex h-[38px] items-center gap-[3px] overflow-hidden bg-grey-1000 ${roundStyle}`}
          >
            {leftComponent}
            <input
              className={
                'size-full overflow-hidden border-none bg-grey-1000 px-[24px] py-[12px] text-sm text-mid outline-none placeholder:text-grey-400 focus:text-high'
              }
              type="text"
              disabled={!enabled}
              readOnly={!enabled}
              placeholder={placeholder}
              value={enabled ? value : ''}
              onChange={(e) => {
                if (hasError) {
                  clearFormError();
                }
                setFormState({
                  ...formState,
                  [formPropertyName]: e.target.value,
                });
              }}
              onBlur={() => {
                if (readOnly || !enabled) return;
                if (!validateProperty)
                  throw new Error('validateProperty is required');
                const errMessage = validateProperty(value);
                if (errMessage) {
                  setErrorMessages({
                    ...errorMessages,
                    [formPropertyName]: errMessage,
                  });
                } else {
                  clearFormError();
                }
              }}
            />
            {hasError && <ErrorMessageIcon errorMessage={errorMessage} />}
            {enabled &&
              initialState &&
              initialState[formPropertyName] !== value && (
                <button className="pr-[16px]" onClick={resetFormValue}>
                  <ResetIcon />
                </button>
              )}
            {rightComponent}
            {enabled && modified && (
              // using fixed position to avoid the modified dot from being clipped by the overflow-hidden parent
              // may need to revisit if form parent placement changes to not be flush right with viewport
              <ModifiedDot className="fixed right-[17.5px] z-10" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FormRow;
