import { useMemo, useRef, useState } from "react";

export function useDecayState(time: number) {
  const [active, _setActive] = useState(false);
  const lastTimeout = useRef<any>();
  const focusCount = useRef<any>(0);

  function clear(existing?: boolean) {
    focusCount.current--;

    if (existing && focusCount.current !== 0) {
      return;
    }

    if (lastTimeout.current) {
      clearTimeout(lastTimeout.current);
      lastTimeout.current = 0;
    }
    lastTimeout.current = setTimeout(() => {
      _setActive(false);
    }, time);
  }

  function set() {
    focusCount.current++;
    if (lastTimeout.current) {
      clearTimeout(lastTimeout.current);
    }
    _setActive(true);
  }

  return useMemo(() => [active, { set, clear }] as const, [active]);
}
