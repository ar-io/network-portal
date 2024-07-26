import { LegacyRef, MouseEventHandler, ReactElement } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

export const Button = ({
  forwardRef,
  className,
  buttonType = ButtonType.SECONDARY,
  icon,
  rightIcon,
  title,
  text,
  active = false,
  onClick,
}: {
  forwardRef?: LegacyRef<HTMLButtonElement>;
  className?: string;
  buttonType?: ButtonType;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  title: string;
  text?: ReactElement | string;
  active?: boolean;
  onClick?: MouseEventHandler;
}) => {
  if (buttonType === ButtonType.PRIMARY) {
    const classNames = [
      'rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start to-btn-primary-outer-gradient-end p-px',
      className,
    ].join(' ');

    const btnClassNames =
      'inline-flex size-full items-center gap-[0.6875rem] rounded-md bg-btn-primary-base bg-gradient-to-b from-btn-primary-gradient-start to-btn-primary-gradient-end px-[0.6875rem] py-[.3125rem] shadow-inner';

    return (
      <div className={classNames}>
        <button
          title={title}
          ref={forwardRef}
          className={
            btnClassNames + (icon ? ' justify-start' : ' justify-center')
          }
          onClick={onClick}
        >
          {icon}
          {text && (
            <div className="text-gradient text-sm leading-tight">{text}</div>
          )}
        </button>
      </div>
    );
  } else if (buttonType === ButtonType.SECONDARY) {
    const baseClassNames =
      'h-[2.125rem]  rounded-md flex items-center space-x-[.6875rem] px-[.6875rem] py-[.3125rem] text-sm';
    const activeClassNames =
      'bg-gradient-to-b shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] dark:bg-[#212124] text-high';
    const nonActiveClassnames =
      'hover: rounded-md hover:bg-gradient-to-b hover:shadow-[0px_0px_0px_1px_#050505,0px_1px_0px_0px_rgba(86,86,86,0.25)_inset] dark:from-[rgba(102,102,102,.06)] dark:to-[rgba(0,0,0,0.06)] hover:dark:bg-[#212124] text-mid';

    const buttonClassNames = [
      baseClassNames,
      active ? activeClassNames : nonActiveClassnames,
      className,
    ].join(' ');
    return (
      <button
        ref={forwardRef}
        title={title}
        className={buttonClassNames}
        onClick={onClick}
      >
        {icon}
        {text && (
          <div
            className={`flex grow items-center space-x-1 leading-none ${icon ? 'justify-start' : 'justify-center'}`}
          >
            {text} {rightIcon}
          </div>
        )}
      </button>
    );
  }

  return <div>Not yet implemented</div>;
};

export default Button;
