import { useState, useCallback } from "react";
import type { CustomEvent } from "../types";

const STORAGE_KEY = "calendar-events";

function loadEvents(): CustomEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CustomEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function useCustomEvents() {
  const [events, setEvents] = useState<CustomEvent[]>(loadEvents);

  const addEvent = useCallback((event: Omit<CustomEvent, "id">) => {
    setEvents((prev) => {
      const next = [...prev, { ...event, id: crypto.randomUUID() }];
      saveEvents(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  return { events, addEvent, deleteEvent };
}
