import { useCallback } from "react";
import type { DateRange } from "../../types";
import { formatMonthYear, formatDateShort, isSameDay } from "../../utils/dateUtils";
import styles from "./NotesPanel.module.css";

interface Props {
  currentMonth: Date;
  dateRange: DateRange;
  content: string;
  isSaving: boolean;
  hasCompleteRange: boolean;
  overlappingRangeLabel: string | null;
  overlappingRangeContent: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onContentChange: (value: string) => void;
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function NotesPanel({
  currentMonth,
  dateRange,
  content,
  isSaving,
  hasCompleteRange,
  overlappingRangeLabel,
  overlappingRangeContent,
  canUndo,
  canRedo,
  onContentChange,
  onClearSelection,
  onUndo,
  onRedo,
}: Props) {
  const hasSingleDate = dateRange.start !== null && dateRange.end === null;
  const isRangeButSameDay =
    hasCompleteRange && isSameDay(dateRange.start!, dateRange.end!);

  let heading: string;
  if (hasCompleteRange && !isRangeButSameDay) {
    heading = `Notes for ${formatDateShort(dateRange.start!)} – ${formatDateShort(dateRange.end!)}`;
  } else if (hasSingleDate || isRangeButSameDay) {
    heading = `Notes for ${formatDateShort(dateRange.start!)}`;
  } else {
    heading = `Monthly Notes — ${formatMonthYear(currentMonth)}`;
  }

  const hasSelection = hasSingleDate || hasCompleteRange;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      }
    },
    [onUndo, onRedo]
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h3 className={styles.title}>{heading}</h3>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.undoBtn}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
          <button
            className={styles.undoBtn}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/>
            </svg>
          </button>
          {isSaving && <span className={styles.savingBadge}>Saving...</span>}
          {hasSelection && (
            <button className={styles.clearBtn} onClick={onClearSelection}>
              Clear
            </button>
          )}
        </div>
      </div>

      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          hasCompleteRange && !isRangeButSameDay
            ? "Write notes for this date range..."
            : hasSingleDate || isRangeButSameDay
              ? "Write notes for this date..."
              : "Write general notes for this month..."
        }
        spellCheck
      />

      {overlappingRangeContent && (
        <div className={styles.overlappingNote}>
          <span className={styles.overlappingLabel}>{overlappingRangeLabel}</span>
          <p className={styles.overlappingText}>{overlappingRangeContent}</p>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.hint}>
          {hasCompleteRange && !isRangeButSameDay
            ? "These notes are tied to the selected date range"
            : hasSingleDate || isRangeButSameDay
              ? "Double-click or drag dates to select a range"
              : "Select a date range on the calendar for range-specific notes"}
        </span>
        <span className={styles.charCount}>{content.length} chars</span>
      </div>
    </div>
  );
}
