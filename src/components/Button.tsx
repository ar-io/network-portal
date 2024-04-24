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
  onClick
}: {
  buttonType?: ButtonType;
  icon?: ReactElement;
  title: string;
  text?: string;
  onClick: MouseEventHandler;
}) => {
  if (buttonType === ButtonType.PRIMARY) {
    return (
      <div className="rounded-md bg-gradient-to-b from-[#EEB3BFA3] to-[#DF9BE808] p-[1px]">
        <button
          title={title}
          className="inline-flex items-center justify-start 
                     gap-[11px] rounded-md bg-grey-800 bg-gradient-to-b from-[rgba(102,102,102,.06)] 
                     to-neutrals-1100 px-[11px] py-[5px] shadow-inner"
          onClick={onClick}
        >
          {icon}
          {text && (
            <div className="bg-gradient-to-r from-[#F7C3A1] to-[#DF9BE8_100%] bg-clip-text text-sm leading-tight text-transparent">
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
