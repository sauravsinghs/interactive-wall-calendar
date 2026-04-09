import { useState, useMemo, useCallback, useRef } from "react";
import { addDays, subDays } from "date-fns";
import type { CalendarDay, DateRange } from "../types";
import {
  getCalendarDays,
  getNextMonth,
  getPrevMonth,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfMonth,
} from "../utils/dateUtils";
import { endOfMonth } from "date-fns";

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectionPhase, setSelectionPhase] = useState<"idle" | "range-picking">("idle");
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const navDirectionRef = useRef<"next" | "prev" | null>(null);
  const dragStartRef = useRef<Date | null>(null);

  const calendarDays: CalendarDay[] = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const navigateToDateMonth = useCallback(
    (date: Date) => {
      if (isSameMonth(date, currentMonth)) return;
      navDirectionRef.current = isBefore(date, currentMonth) ? "prev" : "next";
      setCurrentMonth(startOfMonth(date));
    },
    [currentMonth]
  );

  const goToNextMonth = useCallback(() => {
    navDirectionRef.current = "next";
    setCurrentMonth((m) => getNextMonth(m));
  }, []);

  const goToPrevMonth = useCallback(() => {
    navDirectionRef.current = "prev";
    setCurrentMonth((m) => getPrevMonth(m));
  }, []);

  const goToToday = useCallback(() => {
    navDirectionRef.current = null;
    setCurrentMonth(new Date());
    setDateRange({ start: null, end: null });
    setSelectionPhase("idle");
    setFocusedDate(null);
  }, []);

  const selectDate = useCallback(
    (date: Date) => {
      if (selectionPhase === "range-picking") return;

      if (dateRange.start && isSameDay(date, dateRange.start) && !dateRange.end) {
        setDateRange({ start: null, end: null });
      } else {
        setDateRange({ start: date, end: null });
        navigateToDateMonth(date);
      }
      setSelectionPhase("idle");
    },
    [selectionPhase, dateRange.start, dateRange.end, navigateToDateMonth]
  );

  const handleDoubleClick = useCallback(
    (date: Date) => {
      if (selectionPhase === "idle") {
        setDateRange({ start: date, end: null });
        setSelectionPhase("range-picking");
        navigateToDateMonth(date);
      } else if (selectionPhase === "range-picking") {
        const start = dateRange.start!;
        if (isSameDay(date, start)) {
          setDateRange({ start: null, end: null });
          setSelectionPhase("idle");
          return;
        }
        if (isBefore(date, start)) {
          setDateRange({ start: date, end: start });
        } else {
          setDateRange({ start, end: date });
        }
        setSelectionPhase("idle");
      }
    },
    [selectionPhase, dateRange.start, navigateToDateMonth]
  );

  const clearSelection = useCallback(() => {
    setDateRange({ start: null, end: null });
    setSelectionPhase("idle");
    setFocusedDate(null);
  }, []);

  // Drag-to-select
  const startDrag = useCallback((date: Date) => {
    dragStartRef.current = date;
  }, []);

  const extendDrag = useCallback((date: Date) => {
    const anchor = dragStartRef.current;
    if (!anchor) return;
    if (isSameDay(anchor, date)) {
      setDateRange({ start: anchor, end: null });
    } else if (isBefore(date, anchor)) {
      setDateRange({ start: date, end: anchor });
    } else {
      setDateRange({ start: anchor, end: date });
    }
    setSelectionPhase("idle");
  }, []);

  const endDrag = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  // Keyboard navigation
  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      const cur = focusedDate ?? dateRange.start ?? startOfMonth(currentMonth);

      let next: Date | null = null;
      let handled = true;

      switch (e.key) {
        case "ArrowRight":
          next = addDays(cur, 1);
          break;
        case "ArrowLeft":
          next = subDays(cur, 1);
          break;
        case "ArrowDown":
          next = addDays(cur, 7);
          break;
        case "ArrowUp":
          next = subDays(cur, 7);
          break;
        case "Home":
          next = startOfMonth(currentMonth);
          break;
        case "End":
          next = endOfMonth(currentMonth);
          break;
        case "Enter":
          if (e.shiftKey) {
            handleDoubleClick(cur);
          } else {
            selectDate(cur);
          }
          break;
        case "Escape":
          clearSelection();
          break;
        default:
          handled = false;
      }

      if (handled) e.preventDefault();
      if (next) {
        setFocusedDate(next);
        navigateToDateMonth(next);
      }
    },
    [focusedDate, dateRange.start, currentMonth, handleDoubleClick, selectDate, clearSelection, navigateToDateMonth]
  );

  const hasCompleteRange = dateRange.start !== null && dateRange.end !== null;
  const isRangePicking = selectionPhase === "range-picking";

  const consumeNavDirection = useCallback(() => {
    const dir = navDirectionRef.current;
    navDirectionRef.current = null;
    return dir;
  }, []);

  return {
    currentMonth,
    calendarDays,
    dateRange,
    hasCompleteRange,
    isRangePicking,
    focusedDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    selectDate,
    handleDoubleClick,
    clearSelection,
    consumeNavDirection,
    startDrag,
    extendDrag,
    endDrag,
    handleKeyNav,
  };
}
