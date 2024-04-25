import { MouseEventHandler, ReactElement } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

export const Button = ({
  className,
  buttonType,
  icon = undefined,
  rightIcon = undefined,
  title,
  text = undefined,
  active = false,
  onClick,
}: {
  className?: string;
  buttonType?: ButtonType;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  title: string;
  text?: string;
  active?: boolean;
  onClick: MouseEventHandler;
}) => {
  const resolvedButtonType = buttonType ?? ButtonType.SECONDARY;
  const resolvedActive = active ?? false;

  if (resolvedButtonType === ButtonType.PRIMARY) {
    return (
      <div
        className="rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start
       to-btn-primary-outer-gradient-end p-px"
      >
        <button
          title={title}
          className="inline-flex items-center justify-start 
                     gap-[11px] rounded-md bg-btn-primary-base bg-gradient-to-b 
                     from-btn-primary-gradient-start to-btn-primary-gradient-end 
                     px-[11px] py-[5px] shadow-inner"
          onClick={onClick}
        >
          {icon}
          {text && (
            <div
              className="bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end 
              bg-clip-text text-sm leading-tight text-transparent"
            >
              {text}
            </div>
          )}
        </button>
      </div>
    );
  } else if (resolvedButtonType === ButtonType.SECONDARY) {
    const baseClassNames =
      'h-[34px] rounded-[6px] flex items-center space-x-[11px] px-[11px] py-[5px] text-[14px]';
    const activeClassNames =
      'bg-gradient-to-b shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] dark:bg-[#212124] text-textHigh';
    const nonActiveClassnames =
      'hover:rounded-[6px] hover:bg-gradient-to-b hover:shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] hover:dark:bg-[#212124] text-textMid';

    const buttonClassNames = [
      baseClassNames,
      resolvedActive ? activeClassNames : nonActiveClassnames,
      className,
    ].join(' ');
    return (
      <button
        title={title}
        className={buttonClassNames}
        onClick={resolvedActive ? undefined : onClick}
      >
        {icon}
        {text && (
          <div className="flex grow items-center space-x-[4px] text-left">
            {text} {rightIcon}
          </div>
        )}
      </button>
    );
  }

  return <div>Not yet implemented</div>;
};

export default Button;
