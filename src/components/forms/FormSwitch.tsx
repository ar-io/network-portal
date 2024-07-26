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
      } relative inline-flex h-[1.125rem] w-[1.875rem] items-center rounded-full border border-transparent-100-8`}
      checked={checked}
      onChange={onChange}
      title={title}
    >
      <span className="sr-only"></span>
      <span
        className={`${
          checked ? 'translate-x-3.5' : 'translate-x-0.5'
        } inline-block size-3 rounded-full ${checked ? 'bg-neutrals-1100' : 'bg-neutrals-100'} transition`}
      />
    </Switch>
  );
};

export default FormSwitch;
