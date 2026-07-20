"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  onClose: () => void,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset selection when item count changes (new search results)
  useEffect(() => {
    setSelectedIndex(0);
  }, [itemCount]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % Math.max(itemCount, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + itemCount) % Math.max(itemCount, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (itemCount > 0) onSelect(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [itemCount, selectedIndex, onSelect, onClose],
  );

  return { selectedIndex, setSelectedIndex, listRef, onKeyDown };
}
