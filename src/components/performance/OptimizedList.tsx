import { memo, useCallback } from "react";
import { useVirtualization } from "@/hooks/useVirtualization";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
  containerHeight: number;
  loading?: boolean;
  emptyMessage?: string;
}

export const OptimizedList = memo(<T,>({
  items,
  renderItem,
  keyExtractor,
  itemHeight,
  containerHeight,
  loading = false,
  emptyMessage = "Nessun elemento da visualizzare",
}: OptimizedListProps<T>) => {
  const { scrollRef, visibleItems, offsetY, totalHeight, startIndex } =
    useVirtualization(items, {
      itemHeight,
      containerHeight,
      overscan: 3,
    });

  const renderVisibleItem = useCallback(
    (item: T, index: number) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={keyExtractor(item, actualIndex)}
          style={{ height: itemHeight }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    },
    [startIndex, itemHeight, renderItem, keyExtractor]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{ height: containerHeight, overflow: "auto" }}
      className="relative"
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(renderVisibleItem)}
        </div>
      </div>
    </div>
  );
}) as <T>(props: OptimizedListProps<T>) => JSX.Element;
