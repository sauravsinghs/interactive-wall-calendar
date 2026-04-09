import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import styles from "./MiniMonths.module.css";

interface Props {
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
}

function getMiniDays(month: Date) {
  const mStart = startOfMonth(month);
  const mEnd = endOfMonth(month);
  const calStart = startOfWeek(mStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(mEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: calStart, end: calEnd }).map((d) => ({
    date: d,
    day: d.getDate(),
    inMonth: isSameMonth(d, month),
  }));
}

export function MiniMonths({ currentMonth, onSelectDate }: Props) {
  const today = useMemo(() => new Date(), []);
  const months = useMemo(() => {
    const prev = subMonths(currentMonth, 1);
    const next = addMonths(currentMonth, 1);
    return [prev, currentMonth, next];
  }, [currentMonth]);

  return (
    <div className={styles.strip}>
      {months.map((month) => {
        const days = getMiniDays(month);
        return (
          <div key={month.toISOString()} className={styles.miniMonth}>
            <div className={styles.miniLabel}>{format(month, "MMM yyyy")}</div>
            <div className={styles.miniGrid}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className={styles.miniWeekday}>{d}</span>
              ))}
              {days.map((d) => (
                <button
                  key={d.date.toISOString()}
                  className={[
                    styles.miniDay,
                    !d.inMonth && styles.miniOutside,
                    isSameDay(d.date, today) && styles.miniToday,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectDate(d.date)}
                >
                  {d.day}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
