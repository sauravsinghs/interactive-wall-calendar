export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type Theme = "light" | "dark";

export interface CustomEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  recurrence: "none" | "yearly";
}
