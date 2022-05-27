import { useMemo, useRef, useState } from "react";

export function useDecayState(time: number) {
  const [active, _setActive] = useState(false);
  const lastTimeout = useRef<any>();

  function clear() {
    if (lastTimeout.current) {
      clearTimeout(lastTimeout.current);
      lastTimeout.current = 0;
    }
    lastTimeout.current = setTimeout(() => {
      _setActive(false);
    }, time);
  }

  function set() {
    if (lastTimeout.current) {
      clearTimeout(lastTimeout.current);
    }
    _setActive(true);
  }

  return useMemo(() => [active, { set, clear }] as const, [active]);
}
