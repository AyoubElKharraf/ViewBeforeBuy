import { create } from "zustand";

const KEY = "vbb_compare_ids";

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(ids.slice(0, 3)));
}

type ComparatorState = {
  ids: string[];
  hydrate: () => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useComparatorStore = create<ComparatorState>((set, get) => ({
  ids: [],
  hydrate: () => set({ ids: load() }),
  toggle: (id) => {
    const cur = get().ids;
    const next = cur.includes(id)
      ? cur.filter((x) => x !== id)
      : cur.length >= 3
        ? cur
        : [...cur, id];
    save(next);
    set({ ids: next });
  },
  remove: (id) => {
    const next = get().ids.filter((x) => x !== id);
    save(next);
    set({ ids: next });
  },
  clear: () => {
    save([]);
    set({ ids: [] });
  },
}));
