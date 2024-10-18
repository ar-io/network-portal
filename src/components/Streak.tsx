import { StreakDownArrowIcon, StreakUpArrowIcon } from './icons';

const Streak = ({
  streak,
  fixedDigits = 0,
  rightLabel = '',
}: {
  streak: number;
  fixedDigits?: number;
  rightLabel?: string;
}) => {
  if (streak === 0) {
    return '';
  }

  if (streak === Number.NEGATIVE_INFINITY) {
    return 'N/A';
  }

  const colorClasses =
    streak > 0
      ? 'border-streak-up/[.56] bg-streak-up/[.1] text-streak-up'
      : 'border-text-red/[.56] bg-text-red/[.1] text-text-red';
  const icon =
    streak > 0 ? (
      <StreakUpArrowIcon className="size-3" />
    ) : (
      <StreakDownArrowIcon className="size-3" />
    );

  return (
    <div
      className={`flex w-fit items-center gap-1 rounded-xl border py-0.5 pl-[.4375rem] pr-[.5625rem] ${colorClasses}`}
    >
      {icon} {Math.abs(streak).toFixed(fixedDigits)}{rightLabel}
    </div>
  );
};

export default Streak;
