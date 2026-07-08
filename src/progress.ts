import { useSyncExternalStore } from 'react';

const KEY = 'math-kingdom-progress';
const EVENT = 'math-kingdom-progress-change';

interface Progress {
  completed: string[];
}

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      if (Array.isArray(parsed.completed)) return parsed;
    }
  } catch {
    // Corrupted storage — start fresh.
  }
  return { completed: [] };
}

let snapshot = read();

function write(next: Progress) {
  snapshot = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function markCompleted(id: string) {
  if (!snapshot.completed.includes(id)) {
    write({ ...snapshot, completed: [...snapshot.completed, id] });
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      snapshot = read();
      onChange();
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Ids of adventures the player has finished, updating live across pages/tabs. */
export function useCompleted(): string[] {
  return useSyncExternalStore(subscribe, () => snapshot.completed);
}
