"use client";

import { useEffect } from "react";
import { useComparatorStore } from "@/store/comparator";

export function useComparator() {
  const { ids, hydrate, toggle, remove, clear } = useComparatorStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return {
    ids,
    count: ids.length,
    isSelected: (id: string) => ids.includes(id),
    toggle,
    remove,
    clear,
    canAdd: ids.length < 3,
  };
}
