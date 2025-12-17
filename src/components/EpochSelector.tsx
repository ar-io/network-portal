interface EpochSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const EpochSelector = ({ value, onChange }: EpochSelectorProps) => {
  const epochOptions = [
    { label: 'Last 1 Week', value: 7 },
    { label: 'Last 2 Weeks', value: 14 },
    { label: 'Last 1 Month', value: 30 },
    { label: 'Last 3 Months', value: 90 },
    { label: 'Last 6 Months', value: 180 },
  ];

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-grey-600 bg-grey-800 px-2 py-1 text-xs text-high hover:border-grey-500 focus:border-grey-400 focus:outline-none"
      >
        {epochOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EpochSelector;
