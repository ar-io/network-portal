import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import dayjs, { Dayjs } from 'dayjs';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
/** Six rows of seven keeps the panel a fixed height as months change. */
const CELL_COUNT = 42;

const navButtonClasses =
  'rounded-md p-1 text-mid hover:bg-containerL1 hover:text-high disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

const dayCellClasses = ({
  isSelected,
  isToday,
  isCurrentMonth,
  isDisabled,
}: {
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  isDisabled: boolean;
}) => {
  const base =
    'flex size-9 items-center justify-center rounded-md text-sm transition-colors';

  if (isDisabled) {
    return `${base} cursor-not-allowed text-grey-500 opacity-40`;
  }
  if (isSelected) {
    return `${base} bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end font-medium text-neutrals-1100`;
  }
  if (isToday) {
    return `${base} text-high ring-1 ring-inset ring-grey-500 hover:bg-containerL1`;
  }
  return `${base} ${isCurrentMonth ? 'text-mid' : 'text-grey-400'} hover:bg-containerL1 hover:text-high`;
};

/**
 * Calendar date picker built on the app's own tokens rather than a dependency.
 *
 * Selection is a whole calendar day: the caller converts that to the duration
 * the chain actually stores (see `@src/utils/vaultLock`), so this component
 * never deals in times.
 */
const DatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  hasError = false,
  placeholder = 'Select a date',
  buttonTitle = 'Select a date',
}: {
  value?: Date;
  onChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  hasError?: boolean;
  placeholder?: string;
  buttonTitle?: string;
}) => {
  const min = useMemo(() => dayjs(minDate).startOf('day'), [minDate]);
  const max = useMemo(() => dayjs(maxDate).startOf('day'), [maxDate]);

  // Open on the selected month when there is one, otherwise on the first month
  // the user is allowed to pick in — never on a month that is entirely
  // disabled.
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    (value ? dayjs(value) : min).startOf('month'),
  );

  const selected = value ? dayjs(value).startOf('day') : undefined;
  const today = dayjs().startOf('day');

  // Follow the selection when it changes from outside — picking the "1Y" preset
  // otherwise left the grid on the month it was first opened at, so reopening
  // it showed neither the selected day nor anything near it.
  const selectedMonthKey = selected?.format('YYYY-MM');
  const [lastSelectedMonthKey, setLastSelectedMonthKey] =
    useState(selectedMonthKey);
  if (selectedMonthKey !== lastSelectedMonthKey) {
    setLastSelectedMonthKey(selectedMonthKey);
    if (selected) {
      setViewMonth(selected.startOf('month'));
    }
  }

  const days = useMemo(() => {
    const gridStart = viewMonth.startOf('month').startOf('week');
    return Array.from({ length: CELL_COUNT }, (_, i) =>
      gridStart.add(i, 'day'),
    );
  }, [viewMonth]);

  const minMonth = min.startOf('month');
  const maxMonth = max.startOf('month');

  /** Clamp so a year jump near either bound lands on the bound, not past it. */
  const jumpTo = (target: Dayjs) => {
    if (target.isBefore(minMonth)) return setViewMonth(minMonth);
    if (target.isAfter(maxMonth)) return setViewMonth(maxMonth);
    return setViewMonth(target);
  };

  const canGoBack = viewMonth.isAfter(minMonth);
  const canGoForward = viewMonth.isBefore(maxMonth);

  return (
    <Popover className="relative">
      <PopoverButton
        title={buttonTitle}
        className={`flex h-[3.25rem] w-full items-center justify-between rounded-md border ${
          hasError ? 'border-red-600' : 'border-grey-700'
        } bg-grey-1000 px-4 text-sm outline-none data-[open]:border-grey-500`}
      >
        <span className={selected ? 'text-high' : 'text-grey-400'}>
          {selected ? selected.format('MMMM D, YYYY') : placeholder}
        </span>
        <CalendarDays className="size-4 text-low" />
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8 }}
        // Two things make this read as the date field opening rather than as an
        // unrelated popup: a border brighter than the modal's own `stroke-low`,
        // since the panel floats over the form (and flips above the trigger
        // when the modal has no room below), and `--button-width` — set by
        // Headless UI on an anchored panel — to match the trigger's width, with
        // a floor so the 7-column grid never crushes.
        className="z-[60] w-[var(--button-width)] min-w-[19.5rem] rounded-xl border border-grey-600 bg-containerL3 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
      >
        {({ close }) => (
          <>
            {/* Year jumps as well as month steps: the range runs to 12 years,
                which is 144 clicks away one month at a time. */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center">
                <button
                  type="button"
                  title="Previous year"
                  disabled={!canGoBack}
                  onClick={() => jumpTo(viewMonth.subtract(1, 'year'))}
                  className={navButtonClasses}
                >
                  <ChevronsLeft className="size-4" />
                </button>
                <button
                  type="button"
                  title="Previous month"
                  disabled={!canGoBack}
                  onClick={() => jumpTo(viewMonth.subtract(1, 'month'))}
                  className={navButtonClasses}
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
              <div className="text-sm text-high">
                {viewMonth.format('MMMM YYYY')}
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  title="Next month"
                  disabled={!canGoForward}
                  onClick={() => jumpTo(viewMonth.add(1, 'month'))}
                  className={navButtonClasses}
                >
                  <ChevronRight className="size-4" />
                </button>
                <button
                  type="button"
                  title="Next year"
                  disabled={!canGoForward}
                  onClick={() => jumpTo(viewMonth.add(1, 'year'))}
                  className={navButtonClasses}
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 justify-items-center gap-y-1 pb-1">
              {WEEKDAYS.map((weekday, i) => (
                <div
                  key={`${weekday}-${i}`}
                  className="flex size-9 items-center justify-center text-[0.6875rem] uppercase text-low"
                >
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 justify-items-center gap-y-1">
              {days.map((day) => {
                const isDisabled = day.isBefore(min) || day.isAfter(max);
                const isSelected = !!selected && day.isSame(selected, 'day');

                return (
                  <button
                    key={day.valueOf()}
                    type="button"
                    disabled={isDisabled}
                    title={day.format('MMMM D, YYYY')}
                    onClick={() => {
                      onChange(day.toDate());
                      close();
                    }}
                    className={dayCellClasses({
                      isSelected,
                      isToday: day.isSame(today, 'day'),
                      isCurrentMonth: day.isSame(viewMonth, 'month'),
                      isDisabled,
                    })}
                  >
                    {day.date()}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
};

export default DatePicker;
