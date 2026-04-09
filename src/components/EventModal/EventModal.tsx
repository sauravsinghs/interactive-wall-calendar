import { useState, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import type { CustomEvent } from "../../types";
import styles from "./EventModal.module.css";

const PALETTE = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];

interface Props {
  date: Date;
  anchorRect: DOMRect;
  existingEvents: CustomEvent[];
  onAdd: (event: Omit<CustomEvent, "id">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function EventModal({ date, anchorRect, existingEvents, onAdd, onDelete, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [recurrence, setRecurrence] = useState<"none" | "yearly">("none");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onAdd({
        title: title.trim(),
        date: format(date, "yyyy-MM-dd"),
        color,
        recurrence,
      });
      setTitle("");
    },
    [title, color, recurrence, date, onAdd]
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const top = anchorRect.bottom + 4;
  const left = Math.min(anchorRect.left, window.innerWidth - 240);

  return (
    <div
      ref={modalRef}
      className={styles.modal}
      style={{ top, left }}
    >
      <div className={styles.header}>
        <span className={styles.dateLabel}>{format(date, "MMM d, yyyy")}</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
      </div>

      {existingEvents.length > 0 && (
        <ul className={styles.eventList}>
          {existingEvents.map((ev) => (
            <li key={ev.id} className={styles.eventItem}>
              <span className={styles.eventDot} style={{ background: ev.color }} />
              <span className={styles.eventTitle}>{ev.title}</span>
              {ev.recurrence === "yearly" && <span className={styles.recurBadge}>Yearly</span>}
              <button className={styles.deleteBtn} onClick={() => onDelete(ev.id)} aria-label="Delete event">&times;</button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event name..."
          autoFocus
          maxLength={40}
        />
        <div className={styles.options}>
          <div className={styles.palette}>
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.colorBtn} ${c === color ? styles.colorActive : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <label className={styles.recurLabel}>
            <input
              type="checkbox"
              checked={recurrence === "yearly"}
              onChange={(e) => setRecurrence(e.target.checked ? "yearly" : "none")}
            />
            <span>Yearly</span>
          </label>
        </div>
        <button type="submit" className={styles.addBtn} disabled={!title.trim()}>
          Add Event
        </button>
      </form>
    </div>
  );
}
