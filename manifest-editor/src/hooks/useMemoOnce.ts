import { useReducer, useRef } from "react";

export function useMemoOnce<T>(func: () => T) {
  const valueRef = useRef<T>(undefined as any);
  const [, invalidate] = useReducer((x) => {
    valueRef.current = undefined as any;
    return x + 1;
  }, 0);

  if (!valueRef.current) {
    const newValue = func();
    if (newValue) {
      valueRef.current = newValue;
    }
  }

  return [valueRef, invalidate] as const;
}
