import { useState, useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useCalendar } from "../../hooks/useCalendar";
import { useNotes } from "../../hooks/useNotes";
import { useUndoRedo } from "../../hooks/useUndoRedo";
import { useCustomEvents } from "../../hooks/useCustomEvents";
import { HeroImage } from "../HeroImage/HeroImage";
import { MonthNavigation } from "../MonthNavigation/MonthNavigation";
import { CalendarGrid } from "../CalendarGrid/CalendarGrid";
import { NotesPanel } from "../NotesPanel/NotesPanel";
import { SearchBar } from "../SearchBar/SearchBar";
import { MiniMonths } from "../MiniMonths/MiniMonths";
import { EventModal } from "../EventModal/EventModal";
import { format } from "../../utils/dateUtils";
import type { Theme } from "../../types";
import styles from "./CalendarPage.module.css";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("calendar-theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function CalendarPage() {
  const {
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
  } = useCalendar();

  const { content, updateContent, isSaving, justSaved, daysWithNotes, overlappingNote } =
    useNotes(currentMonth, dateRange);

  const undoRedo = useUndoRedo(content);
  const prevKeyRef = useRef("");
  const notesKey = `${dateRange.start?.toISOString()}_${dateRange.end?.toISOString()}_${currentMonth.toISOString()}`;

  useEffect(() => {
    if (notesKey !== prevKeyRef.current) {
      undoRedo.reset(content);
      prevKeyRef.current = notesKey;
    }
  }, [notesKey, content, undoRedo]);

  const handleContentChange = useCallback(
    (value: string) => {
      updateContent(value);
      undoRedo.push(value);
    },
    [updateContent, undoRedo]
  );

  const handleUndo = useCallback(() => {
    const val = undoRedo.undo();
    if (val !== null) updateContent(val);
  }, [undoRedo, updateContent]);

  const handleRedo = useCallback(() => {
    const val = undoRedo.redo();
    if (val !== null) updateContent(val);
  }, [undoRedo, updateContent]);

  const { events, addEvent, deleteEvent } = useCustomEvents();

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [navDirection, setNavDirection] = useState<"next" | "prev" | null>(null);
  const [searchMatches, setSearchMatches] = useState<Set<string>>(new Set());
  const [eventModal, setEventModal] = useState<{ date: Date; rect: DOMRect } | null>(null);
  const prevMonthRef = useRef(currentMonth);

  // Confetti on save
  useEffect(() => {
    if (justSaved) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { x: 0.75, y: 0.35 },
        colors: ["#4a6741", "#d4e7cd", "#3498db"],
        disableForReducedMotion: true,
      });
    }
  }, [justSaved]);

  useEffect(() => {
    if (prevMonthRef.current.getTime() !== currentMonth.getTime()) {
      const dir = consumeNavDirection();
      if (dir) setNavDirection(dir);
      prevMonthRef.current = currentMonth;
    }
  }, [currentMonth, consumeNavDirection]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("calendar-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const handlePrev = useCallback(() => {
    goToPrevMonth();
  }, [goToPrevMonth]);

  const handleNext = useCallback(() => {
    goToNextMonth();
  }, [goToNextMonth]);

  const handleClear = useCallback(() => {
    updateContent("");
    clearSelection();
  }, [updateContent, clearSelection]);

  const handleSearchResultClick = useCallback(
    (date: Date) => {
      selectDate(date);
    },
    [selectDate]
  );

  const handleContextMenu = useCallback((date: Date, rect: DOMRect) => {
    setEventModal({ date, rect });
  }, []);

  const modalDateKey = eventModal ? format(eventModal.date, "yyyy-MM-dd") : "";
  const modalEvents = eventModal
    ? events.filter(
        (ev) =>
          ev.date === modalDateKey ||
          (ev.recurrence === "yearly" && ev.date.slice(5) === modalDateKey.slice(5))
      )
    : [];

  return (
    <>
      <div className={styles.topBar}>
        <SearchBar onResultClick={handleSearchResultClick} onMatchesChange={setSearchMatches} />
      </div>

      <div className={styles.layout}>
        <div className={styles.calendarColumn}>
          <div className={styles.calendarCard}>
            <div className={styles.ringBar}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.ring}>
                  <div className={styles.ringHole} />
                </div>
              ))}
            </div>

            <HeroImage currentMonth={currentMonth} direction={navDirection} />

            <div className={styles.calendarBody}>
              <MonthNavigation
                currentMonth={currentMonth}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={goToToday}
              />

              {isRangePicking && (
                <div className={styles.rangeHint}>
                  Double-click another date to complete the range
                </div>
              )}

              <CalendarGrid
                days={calendarDays}
                dateRange={dateRange}
                daysWithNotes={daysWithNotes}
                isRangePicking={isRangePicking}
                focusedDate={focusedDate}
                searchMatches={searchMatches}
                events={events}
                onSelectDate={selectDate}
                onDoubleClickDate={handleDoubleClick}
                onDragStart={startDrag}
                onDragEnter={extendDrag}
                onDragEnd={endDrag}
                onKeyNav={handleKeyNav}
                onContextMenu={handleContextMenu}
              />
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>
          </div>

          <div className={styles.miniMobile}>
            <MiniMonths currentMonth={currentMonth} onSelectDate={selectDate} />
          </div>
        </div>

        <div className={styles.notesColumn}>
          <NotesPanel
            currentMonth={currentMonth}
            dateRange={dateRange}
            content={content}
            isSaving={isSaving}
            hasCompleteRange={hasCompleteRange}
            overlappingRangeLabel={overlappingNote?.label ?? null}
            overlappingRangeContent={overlappingNote?.content ?? null}
            canUndo={undoRedo.canUndo}
            canRedo={undoRedo.canRedo}
            onContentChange={handleContentChange}
            onClearSelection={handleClear}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
          <div className={styles.miniDesktop}>
            <MiniMonths currentMonth={currentMonth} onSelectDate={selectDate} />
          </div>
        </div>
      </div>

      {eventModal && (
        <EventModal
          date={eventModal.date}
          anchorRect={eventModal.rect}
          existingEvents={modalEvents}
          onAdd={addEvent}
          onDelete={deleteEvent}
          onClose={() => setEventModal(null)}
        />
      )}
    </>
  );
}
