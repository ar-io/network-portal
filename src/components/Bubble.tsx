const Bubble = ({ value, customText, additionalClasses }: { value: boolean, customText?:string, additionalClasses?:string }) => {
  const colorClasses = value
    ? 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up'
    : 'border-text-red/[.56] bg-text-red/[.1] text-text-red';

  return (
    <div
      className={`flex w-fit items-center gap-1 rounded-xl border px-2 py-0.5 ${colorClasses} ${additionalClasses}`}
    >
      {customText ? customText : value ? 'Passed' : 'Failed'}
    </div>
  );
};

export default Bubble;
