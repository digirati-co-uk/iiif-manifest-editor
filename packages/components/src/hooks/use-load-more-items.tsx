import { useState, useMemo, useCallback } from "react";

export function useLoadMoreItems<T extends object>(
  items: T[],
  options: {
    batchSize: number;
  },
) {
  const [index, setIndex] = useState(options.batchSize);

  const itemsFiltered = useMemo(() => {
    return items.slice(0, index);
  }, [items, index]);

  const loadMore = useCallback(() => {
    setIndex((prevIndex) => prevIndex + options.batchSize);
  }, [options.batchSize]);

  const intersector = useMemo(
    () => (
      <div
        style={{ width: 1, height: 1 }}
        ref={(intersectorRef) => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0]?.isIntersecting) {
                loadMore();
              }
            },
            { root: intersectorRef?.parentElement, threshold: 0.1 },
          );

          if (intersectorRef) {
            observer.observe(intersectorRef);
          }

          return () => {
            if (intersectorRef) {
              observer.unobserve(intersectorRef);
            }
          };
        }}
      />
    ),
    [loadMore],
  );

  const isFullyLoaded = index >= items.length;

  const reset = () => {
    setIndex(options.batchSize);
  };

  return [
    isFullyLoaded ? items : itemsFiltered,
    {
      intersector: isFullyLoaded ? null : intersector,
      loadMore,
      isFullyLoaded,
      reset,
    },
  ] as const;
}
