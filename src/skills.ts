import { useSyncExternalStore } from 'react';

const KEY = 'math-kingdom-skills';
const EVENT = 'math-kingdom-skills-change';

interface Skills {
  unlocked: string[];
}

function read(): Skills {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Skills;
      if (Array.isArray(parsed.unlocked)) return parsed;
    }
  } catch {
    // Corrupted storage — start fresh.
  }
  return { unlocked: [] };
}

let snapshot = read();

function write(next: Skills) {
  snapshot = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function unlockSkill(id: string) {
  if (!snapshot.unlocked.includes(id)) {
    write({ ...snapshot, unlocked: [...snapshot.unlocked, id] });
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

/** Ids of skills the player has unlocked, updating live across pages/tabs. */
export function useUnlockedSkills(): string[] {
  return useSyncExternalStore(subscribe, () => snapshot.unlocked);
}
