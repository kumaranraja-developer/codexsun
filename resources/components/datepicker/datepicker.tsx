import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { format } from "date-fns";
import Error from "../error/Error";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  id?: string;
  label?: string;
  model?: Date;
  formatStr?: string;
  className?: string;
  err?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onChange?: (date: string) => void;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      id,
      label,
      model,
      formatStr = "yyyy-MM-dd",
      // formatStr = "MMM dd, yyyy",
      className = "",
      err,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState<Date>(
      model ? new Date(model) : new Date()
    );
    const [calendarDays, setCalendarDays] = useState<
      { day: number; date: Date; currentMonth: boolean }[]
    >([]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const month = date.getMonth();
    const year = date.getFullYear();
    const initialDate = useRef(new Date());

    const isLabelFloated =
      !!model || date.toDateString() !== initialDate.current.toDateString();
    const shouldLabelFloat = isLabelFloated || isOpen;

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (model) {
        const normalized = new Date(
          model.getFullYear(),
          model.getMonth(),
          model.getDate()
        );
        setDate(normalized);
      } else {
        setDate(new Date());
      }
    }, [model]);

    useEffect(() => {
      const currentMonthDays = new Date(year, month + 1, 0).getDate();
      const startDay = new Date(year, month, 1).getDay();
      const days: { day: number; date: Date; currentMonth: boolean }[] = [];

      if (startDay > 0) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
        for (let i = prevMonthDays - startDay + 1; i <= prevMonthDays; i++) {
          days.push({
            day: i,
            date: new Date(prevYear, prevMonth, i),
            currentMonth: false,
          });
        }
      }

      for (let i = 1; i <= currentMonthDays; i++) {
        days.push({
          day: i,
          date: new Date(year, month, i),
          currentMonth: true,
        });
      }

      const nextDayCount = 42 - days.length;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let i = 1; i <= nextDayCount; i++) {
        days.push({
          day: i,
          date: new Date(nextYear, nextMonth, i),
          currentMonth: false,
        });
      }

      setCalendarDays(days);
    }, [month, year]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectDate = (selectedDate: Date) => {
      // Normalize date (remove time)
      const normalized = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      setDate(normalized);

      // Return formatted string 'yyyy-MM-dd' instead of full Date object
      const formatted = format(normalized, "yyyy-MM-dd");
      onChange?.(formatted as any); // cast to any if onChange expects Date type

      setIsOpen(false);
    };

    const isToday = (d: Date) => new Date().toDateString() === d.toDateString();
    const isSelected = (d: Date) => model?.toDateString() === d.toDateString();

    const changeMonth = (direction: number) => {
      const newMonth = new Date(year, month + direction, 1);
      setDate(newMonth);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMonth = parseInt(e.target.value);
      setDate(new Date(year, newMonth, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newYear = parseInt(e.target.value);
      setDate(new Date(newYear, month, 1));
    };

    const years = Array.from(
      { length: 101 },
      (_, i) => new Date().getFullYear() - 50 + i
    );

    return (
      <div
        className={`relative w-full font-inter ${className}`}
        ref={wrapperRef}
      >
        <div
          id={`input-wrapper-${id}`}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center px-2 pt-1.5 pb-1 h-10
            border border-ring/80 rounded-md transition-all cursor-pointer
            text-foreground/90 focus:ring-2 focus:ring-ring/80
            ${err ? "bg-input-warning" : "bg-background"}
          `}
        >
          <input
            id={id}
            ref={inputRef}
            readOnly
            value={model ? format(model, formatStr) : ""}
            placeholder=" "
            onKeyDown={onKeyDown}
            className={`flex-1 px-1 py-1 text-sm outline-none placeholder-transparent peer text-foreground cursor-pointer
              ${err ? "bg-input-warning" : "bg-transparent"}
            `}
          />

          <label
            htmlFor={id}
            className={`absolute left-2.5 px-1 text-sm text-foreground/40 transition-all transform origin-[0] cursor-pointer
              ${
                shouldLabelFloat
                  ? "top-2 scale-75 -translate-y-4"
                  : "top-1/2 -translate-y-1/2 scale-100"
              }
             ${err ? "bg-input-warning" : "bg-background"}
            `}
          >
            {label}
          </label>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 pointer-events-none">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full z-10 left-0 mt-2 w-80 p-4 rounded-lg shadow-lg border bg-background text-foreground/90 border-gray-300 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <select
                  value={month}
                  onChange={handleMonthChange}
                  className="text-sm px-2 py-1 border rounded-md bg-background text-foreground/90 border-gray-300 dark:border-neutral-600"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={handleYearChange}
                  className="text-sm px-2 py-1 border rounded-md bg-background text-foreground/90 border-gray-300 dark:border-neutral-600"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 rounded-full text-foreground/60 hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 rounded-full text-foreground/60 hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-3 text-xs font-medium text-center text-foreground/70">
              {dayNames.map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ day, date: d, currentMonth }, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center aspect-square"
                >
                  <button
                    onClick={() => selectDate(d)}
                    className={`flex items-center justify-center text-sm rounded-full h-8 w-8 transition-colors duration-200
                      ${
                        isToday(d)
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-neutral-700"
                      }
                      ${
                        isSelected(d)
                          ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500"
                          : ""
                      }
                      ${
                        !currentMonth
                          ? "opacity-50 text-foreground/50"
                          : "text-foreground/90"
                      }
                    `}
                  >
                    {day}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {err && (
          <Error
            message={err}
            className="mt-1 text-sm text-delete"
            id={id as any}
          />
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
