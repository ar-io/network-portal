import { MouseEventHandler, ReactElement } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

export const Button = ({
  buttonType = ButtonType.SECONDARY,
  icon = undefined,
  title,
  text = undefined,
  onClick,
}: {
  buttonType?: ButtonType;
  icon?: ReactElement;
  title: string;
  text?: string;
  onClick: MouseEventHandler;
}) => {
  if (buttonType === ButtonType.PRIMARY) {
    return (
      <div className="rounded-md bg-gradient-to-b from-btn-primary-outer-gradient-start
       to-btn-primary-outer-gradient-end p-[1px]">
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
            <div className="bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end 
              bg-clip-text text-sm leading-tight text-transparent">
              {text}
            </div>
          )}
        </button>
      </div>
    );
  }

  return <div>Not yet implemented</div>;
};

export default Button;
