import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  eachDayOfInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  format,
  isWithinInterval,
} from "date-fns";
import type { DateRange } from "../types";
import { getNotesKey, formatDateShort } from "../utils/dateUtils";

const DEBOUNCE_MS = 400;

function scanDaysWithNotes(month: Date): Map<string, number> {
  const result = new Map<string, number>();
  const monthStr = format(month, "yyyy-MM");
  const mStart = startOfMonth(month);
  const mEnd = endOfMonth(month);

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("notes-")) continue;
    const val = localStorage.getItem(k);
    if (!val || !val.trim()) continue;

    const len = val.trim().length;
    const body = k.slice(6);

    if (body.includes("_")) {
      const [startStr, endStr] = body.split("_");
      try {
        const s = parseISO(startStr);
        const e = parseISO(endStr);
        for (const d of eachDayOfInterval({ start: s, end: e })) {
          if (d >= mStart && d <= mEnd) {
            const key = format(d, "yyyy-MM-dd");
            result.set(key, Math.max(result.get(key) ?? 0, len));
          }
        }
      } catch {
        /* skip malformed keys */
      }
    } else if (body === monthStr) {
      for (const d of eachDayOfInterval({ start: mStart, end: mEnd })) {
        const key = format(d, "yyyy-MM-dd");
        result.set(key, Math.max(result.get(key) ?? 0, len));
      }
    }
  }

  return result;
}

interface OverlappingNote {
  label: string;
  content: string;
}

function findOverlappingRangeNote(dateRange: DateRange): OverlappingNote | null {
  if (!dateRange.start) return null;
  const target = dateRange.start;

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("notes-")) continue;
    const val = localStorage.getItem(k);
    if (!val || !val.trim()) continue;

    const body = k.slice(6);
    if (!body.includes("_")) continue;

    const [startStr, endStr] = body.split("_");
    if (startStr === endStr) continue; // skip single-date keys

    try {
      const s = parseISO(startStr);
      const e = parseISO(endStr);
      if (isWithinInterval(target, { start: s, end: e })) {
        return {
          label: `From range: ${formatDateShort(s)} – ${formatDateShort(e)}`,
          content: val,
        };
      }
    } catch {
      /* skip */
    }
  }

  // Also check monthly note
  const monthKey = `notes-${format(target, "yyyy-MM")}`;
  const monthVal = localStorage.getItem(monthKey);
  if (monthVal && monthVal.trim()) {
    const monthDate = startOfMonth(target);
    return {
      label: `Monthly note: ${format(monthDate, "MMMM yyyy")}`,
      content: monthVal,
    };
  }

  return null;
}

export function useNotes(currentMonth: Date, dateRange: DateRange) {
  const key = getNotesKey(currentMonth, dateRange);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [noteRevision, setNoteRevision] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    setContent(stored ?? "");
  }, [key]);

  const persist = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSaving(true);
      timerRef.current = setTimeout(() => {
        if (value.trim()) {
          localStorage.setItem(key, value);
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 100);
        } else {
          localStorage.removeItem(key);
        }
        setIsSaving(false);
        setNoteRevision((r) => r + 1);
      }, DEBOUNCE_MS);
    },
    [key]
  );

  const updateContent = useCallback(
    (value: string) => {
      setContent(value);
      persist(value);
    },
    [persist]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const daysWithNotes = useMemo(
    () => scanDaysWithNotes(currentMonth),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth, noteRevision]
  );

  const overlappingNote = useMemo(() => {
    return findOverlappingRangeNote(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, dateRange.start, dateRange.end, noteRevision]);

  return {
    content,
    updateContent,
    isSaving,
    justSaved,
    notesKey: key,
    daysWithNotes,
    overlappingNote,
  };
}
