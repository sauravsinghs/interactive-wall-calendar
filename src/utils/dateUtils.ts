import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  format,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
} from "date-fns";
import type { CalendarDay, DateRange } from "../types";

const HOLIDAYS: Record<string, string> = {
  "01-01": "New Year's Day",
  "01-26": "Republic Day",
  "08-15": "Independence Day",
  "10-02": "Gandhi Jayanti",
  "12-25": "Christmas",
};

export function getCalendarDays(month: Date): CalendarDay[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const today = new Date();

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(
    (date) => {
      const mmdd = format(date, "MM-dd");
      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: isSameMonth(date, month),
        isToday: isSameDay(date, today),
        isHoliday: mmdd in HOLIDAYS,
        holidayName: HOLIDAYS[mmdd],
      };
    }
  );
}

export function isInRange(date: Date, range: DateRange): boolean {
  if (!range.start || !range.end) return false;
  return isWithinInterval(date, { start: range.start, end: range.end });
}

export function isRangeStart(date: Date, range: DateRange): boolean {
  return !!range.start && isSameDay(date, range.start);
}

export function isRangeEnd(date: Date, range: DateRange): boolean {
  return !!range.end && isSameDay(date, range.end);
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatDateShort(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function getNotesKey(month: Date, range: DateRange): string {
  if (range.start && range.end) {
    return `notes-${format(range.start, "yyyy-MM-dd")}_${format(range.end, "yyyy-MM-dd")}`;
  }
  if (range.start) {
    const d = format(range.start, "yyyy-MM-dd");
    return `notes-${d}_${d}`;
  }
  return `notes-${format(month, "yyyy-MM")}`;
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1);
}

export { isSameDay, isSameMonth, isAfter, isBefore, format, startOfMonth };

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
