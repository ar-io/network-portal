import { Switch } from '@headlessui/react';

const FormSwitch = ({
  checked,
  onChange,
  title,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
}) => {
  return (
    <Switch
      className={`${
        checked ? 'bg-green-600' : 'bg-grey-800'
      } relative inline-flex h-[18px] w-[30px] items-center rounded-full border border-transparent-100-8`}
      checked={checked}
      onChange={onChange}
      title={title}
    >
      <span className="sr-only"></span>
      <span
        className={`${
          checked ? 'translate-x-[14px]' : 'translate-x-[2px]'
        } inline-block size-[12px] rounded-full ${checked ? 'bg-neutrals-1100' : 'bg-neutrals-100'} transition`}
      />
    </Switch>
  );
};

export default FormSwitch;