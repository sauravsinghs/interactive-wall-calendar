import { useRef, useCallback } from "react";
import type { CalendarDay, DateRange, CustomEvent } from "../../types";
import { isInRange, isRangeStart, isRangeEnd } from "../../utils/dateUtils";
import styles from "./DayCell.module.css";

interface Props {
  day: CalendarDay;
  dateRange: DateRange;
  noteIntensity: number;
  isRangePicking: boolean;
  isFocused: boolean;
  isSearchMatch: boolean;
  events: CustomEvent[];
  onClick: (date: Date) => void;
  onDoubleClick: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onContextMenu: (date: Date, rect: DOMRect) => void;
}

const DOUBLE_TAP_MS = 300;

export function DayCell({
  day,
  dateRange,
  noteIntensity,
  isRangePicking,
  isFocused,
  isSearchMatch,
  events,
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
}: Props) {
  const { date, dayOfMonth, isCurrentMonth, isToday, isHoliday, holidayName } = day;
  const lastTapRef = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  const start = isRangeStart(date, dateRange);
  const end = isRangeEnd(date, dateRange);
  const inRange = isInRange(date, dateRange);
  const singleSelect = start && !dateRange.end;

  const tooltipParts: string[] = [];
  if (holidayName) tooltipParts.push(holidayName);
  if (events.length > 0) tooltipParts.push(...events.map((ev) => ev.title));
  const tooltipText = tooltipParts.join(" | ") || undefined;

  const cellClasses = [
    styles.cell,
    !isCurrentMonth && styles.outsideMonth,
    isToday && styles.today,
    start && styles.rangeStart,
    end && styles.rangeEnd,
    inRange && !start && !end && styles.inRange,
    singleSelect && styles.singleSelect,
    isRangePicking && styles.rangePicking,
    tooltipText && styles.hasTooltip,
    isFocused && styles.focused,
    isSearchMatch && styles.searchMatch,
    noteIntensity > 0 && styles[`heatmap${noteIntensity}`],
  ]
    .filter(Boolean)
    .join(" ");

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        e.preventDefault();
        lastTapRef.current = 0;
        onDoubleClick(date);
      } else {
        lastTapRef.current = now;
      }
    },
    [date, onDoubleClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (btnRef.current) {
        onContextMenu(date, btnRef.current.getBoundingClientRect());
      }
    },
    [date, onContextMenu]
  );

  return (
    <button
      ref={btnRef}
      className={cellClasses}
      onClick={() => onClick(date)}
      onDoubleClick={() => onDoubleClick(date)}
      onMouseDown={(e) => {
        if (e.button === 0) onMouseDown(date);
      }}
      onMouseEnter={() => onMouseEnter(date)}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      data-tooltip={tooltipText}
      aria-label={`${dayOfMonth}${isHoliday ? `, ${holidayName}` : ""}${events.length > 0 ? `, ${events.map((e) => e.title).join(", ")}` : ""}${noteIntensity > 0 ? ", has notes" : ""}`}
    >
      <span className={styles.dayNumber}>{dayOfMonth}</span>
      {isToday && <span className={styles.todayDot} />}
      {isHoliday && <span className={styles.holidayDot} />}
      {noteIntensity > 0 && <span className={styles.noteDot} />}
      {events.length > 0 && (
        <span className={styles.eventTags}>
          {events.slice(0, 2).map((ev) => (
            <span
              key={ev.id}
              className={styles.eventTag}
              style={{ background: ev.color }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
