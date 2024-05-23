import { useLayoutEffect, useState } from "react";

export function useFastList<T>(list: undefined | T[], firstRender = 24): T[] {
  const [isMounted, setIsMounted] = useState(false);
  useLayoutEffect(() => {
    if (list) {
      setTimeout(() => {
        setIsMounted(true);
      }, 0);
    }
  }, [list]);

  if (!list) {
    return [];
  }

  if (isMounted) {
    return list;
  }

  return list.slice(0, firstRender);
}
