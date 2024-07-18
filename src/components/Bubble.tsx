const Bubble = ({ value, customText, additionalClasses }: { value: boolean, customText?:string, additionalClasses?:string }) => {
  const colorClasses = value
    ? 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up'
    : 'border-text-red/[.56] bg-text-red/[.1] text-text-red';

  return (
    <div
      className={`flex w-fit items-center gap-[4px] rounded-xl border px-[9px] py-[2px] ${colorClasses} ${additionalClasses}`}
    >
      {customText ? customText : value ? 'Passed' : 'Failed'}
    </div>
  );
};

export default Bubble;
