import { ChevronDown } from "lucide-react";

type DropdownProps = {
  options: { label: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  tightPadding?: boolean;
};

const Dropdown = ({
  options,
  onChange,
  value,
  tightPadding = false,
}: DropdownProps) => {
  return (
    <div className="relative w-fit min-w-fit">
      <select
        className={`cursor-pointer appearance-none rounded-xl bg-transparent ${!tightPadding && 'py-4 pl-4'} pr-10 text-mid outline-none`}
        onChange={onChange}
        value={value}
      >
        {options.map((option, index) => {
          return (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      <div
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-grey-1100 bg-containerL3 bg-gradient-to-b 
     from-[rgba(102,102,102,0.06)] to-[rgba(0,0,0,0.06)] p-1 shadow-inner  shadow-grey-600"
      >
        <ChevronDown className="pointer-events-none size-4  text-mid" />
      </div>
    </div>
  );
};

export default Dropdown;
