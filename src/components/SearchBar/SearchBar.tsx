import { useState, useCallback, useRef, useEffect } from "react";
import { parseISO, format } from "date-fns";
import type { CustomEvent } from "../../types";
import styles from "./SearchBar.module.css";

interface SearchResult {
  key: string;
  label: string;
  snippet: string;
  dates: string[];
}

interface Props {
  onResultClick: (date: Date) => void;
  onMatchesChange: (matches: Set<string>) => void;
}

function loadCustomEvents(): CustomEvent[] {
  try {
    const raw = localStorage.getItem("calendar-events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function searchNotes(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("notes-")) continue;
    const val = localStorage.getItem(k);
    if (!val) continue;

    if (!val.toLowerCase().includes(q)) continue;

    const body = k.slice(6);
    const dates: string[] = [];
    let label = "";

    if (body.includes("_")) {
      const [startStr, endStr] = body.split("_");
      dates.push(startStr);
      if (startStr !== endStr) dates.push(endStr);
      try {
        const s = parseISO(startStr);
        const e = parseISO(endStr);
        label =
          startStr === endStr
            ? format(s, "MMM d, yyyy")
            : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
      } catch {
        label = body;
      }
    } else {
      label = `Monthly: ${body}`;
    }

    const idx = val.toLowerCase().indexOf(q);
    const start = Math.max(0, idx - 20);
    const end = Math.min(val.length, idx + query.length + 30);
    const snippet =
      (start > 0 ? "..." : "") +
      val.slice(start, end) +
      (end < val.length ? "..." : "");

    results.push({ key: k, label, snippet, dates });
  }

  const events = loadCustomEvents();
  for (const ev of events) {
    if (!ev.title.toLowerCase().includes(q)) continue;
    try {
      const d = parseISO(ev.date);
      const label = `Event: ${format(d, "MMM d, yyyy")}`;
      const snippet = ev.title + (ev.recurrence === "yearly" ? " (Yearly)" : "");
      results.push({ key: `event-${ev.id}`, label, snippet, dates: [ev.date] });
    } catch { /* skip malformed dates */ }
  }

  return results;
}

export function SearchBar({ onResultClick, onMatchesChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(
    (q: string) => {
      const r = searchNotes(q);
      setResults(r);
      setIsOpen(r.length > 0);
      const matchSet = new Set<string>();
      r.forEach((res) => res.dates.forEach((d) => matchSet.add(d)));
      onMatchesChange(matchSet);
    },
    [onMatchesChange]
  );

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => runSearch(value), 200);
    },
    [runSearch]
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      const dateStr = result.dates[0];
      if (dateStr) {
        try {
          onResultClick(parseISO(dateStr));
        } catch { /* skip */ }
      }
      setIsOpen(false);
    },
    [onResultClick]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrap}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search notes & events..."
          aria-label="Search notes and events"
        />
        {query && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              onMatchesChange(new Set());
            }}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((r) => (
            <li key={r.key}>
              <button className={styles.resultBtn} onClick={() => handleResultClick(r)}>
                <span className={styles.resultLabel}>{r.label}</span>
                <span className={styles.resultSnippet}>{r.snippet}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
