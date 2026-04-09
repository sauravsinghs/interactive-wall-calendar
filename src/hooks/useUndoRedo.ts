import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useUndoRedo(initial: string) {
  const [history, setHistory] = useState<string[]>([initial]);
  const [pointer, setPointer] = useState(0);
  const suppressRef = useRef(false);

  const push = useCallback((value: string) => {
    if (suppressRef.current) return;
    setHistory((h) => {
      const next = [...h.slice(0, pointer + 1), value];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setPointer((p) => Math.min(p + 1, MAX_HISTORY - 1));
  }, [pointer]);

  const undo = useCallback((): string | null => {
    if (pointer <= 0) return null;
    const newP = pointer - 1;
    setPointer(newP);
    suppressRef.current = true;
    setTimeout(() => { suppressRef.current = false; }, 0);
    return history[newP];
  }, [pointer, history]);

  const redo = useCallback((): string | null => {
    if (pointer >= history.length - 1) return null;
    const newP = pointer + 1;
    setPointer(newP);
    suppressRef.current = true;
    setTimeout(() => { suppressRef.current = false; }, 0);
    return history[newP];
  }, [pointer, history]);

  const reset = useCallback((value: string) => {
    setHistory([value]);
    setPointer(0);
  }, []);

  return {
    push,
    undo,
    redo,
    reset,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
  };
}
