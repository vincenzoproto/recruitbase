import { useState, useEffect, useRef, useCallback } from "react";

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render above/below visible area
}

export const useVirtualization = <T>(
  items: T[],
  config: VirtualizationConfig
) => {
  const { itemHeight, containerHeight, overscan = 3 } = config;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );
  const endIndex = Math.min(
    items.length,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    scrollRef,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
  };
};
