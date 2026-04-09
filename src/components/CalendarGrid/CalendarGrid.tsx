import { useCallback, useEffect, useRef } from "react";
import type { CalendarDay, DateRange, CustomEvent } from "../../types";
import { WEEKDAYS, format, isSameDay } from "../../utils/dateUtils";
import { DayCell } from "../DayCell/DayCell";
import styles from "./CalendarGrid.module.css";

function noteIntensity(len: number): number {
  if (len <= 0) return 0;
  if (len <= 50) return 1;
  if (len <= 150) return 2;
  if (len <= 300) return 3;
  return 4;
}

interface Props {
  days: CalendarDay[];
  dateRange: DateRange;
  daysWithNotes: Map<string, number>;
  isRangePicking: boolean;
  focusedDate: Date | null;
  searchMatches: Set<string>;
  events: CustomEvent[];
  onSelectDate: (date: Date) => void;
  onDoubleClickDate: (date: Date) => void;
  onDragStart: (date: Date) => void;
  onDragEnter: (date: Date) => void;
  onDragEnd: () => void;
  onKeyNav: (e: React.KeyboardEvent) => void;
  onContextMenu: (date: Date, rect: DOMRect) => void;
}

export function CalendarGrid({
  days,
  dateRange,
  daysWithNotes,
  isRangePicking,
  focusedDate,
  searchMatches,
  events,
  onSelectDate,
  onDoubleClickDate,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onKeyNav,
  onContextMenu,
}: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (date: Date) => {
      isDragging.current = true;
      onDragStart(date);
    },
    [onDragStart]
  );

  const handleMouseEnter = useCallback(
    (date: Date) => {
      if (isDragging.current) onDragEnter(date);
    },
    [onDragEnter]
  );

  useEffect(() => {
    const handleUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onDragEnd();
      }
    };
    document.addEventListener("mouseup", handleUp);
    return () => document.removeEventListener("mouseup", handleUp);
  }, [onDragEnd]);

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      tabIndex={0}
      onKeyDown={onKeyNav}
      role="grid"
      aria-label="Calendar grid"
    >
      {WEEKDAYS.map((day) => (
        <div key={day} className={styles.weekdayHeader} role="columnheader">
          {day}
        </div>
      ))}
      {days.map((day) => {
        const dateKey = format(day.date, "yyyy-MM-dd");
        const dayEvents = events.filter(
          (ev) =>
            ev.date === dateKey ||
            (ev.recurrence === "yearly" &&
              ev.date.slice(5) === dateKey.slice(5))
        );
        return (
          <DayCell
            key={day.date.toISOString()}
            day={day}
            dateRange={dateRange}
            noteIntensity={noteIntensity(daysWithNotes.get(dateKey) ?? 0)}
            isRangePicking={isRangePicking}
            isFocused={!!focusedDate && isSameDay(day.date, focusedDate)}
            isSearchMatch={searchMatches.has(dateKey)}
            events={dayEvents}
            onClick={onSelectDate}
            onDoubleClick={onDoubleClickDate}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onContextMenu={onContextMenu}
          />
        );
      })}
    </div>
  );
}
