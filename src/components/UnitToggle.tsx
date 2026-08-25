/**
 * ARIO / USD switch for charts that can be denominated either way.
 *
 * A toggle rather than a second axis: the two are the same quantity in
 * different units, so showing both at once invites reading a relationship
 * between them that does not exist.
 */
const UnitToggle = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) => (
  <div className="flex overflow-hidden rounded-md border border-grey-600 text-xs">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        // Roomier on a phone, where 24px is an awkward tap target.
        className={`px-3 py-2 transition-colors sm:px-2.5 sm:py-1 ${
          value === option.value
            ? 'bg-grey-700 text-high'
            : 'text-low hover:text-mid'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default UnitToggle;
