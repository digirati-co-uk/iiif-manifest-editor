import mitt from "mitt";
import { useEffect, useRef, useState } from "react";

// @ts-expect-error
globalThis.MS_LS_EMITTER = globalThis.MS_LS_EMITTER || mitt();
// @ts-expect-error
const lsEmitter = globalThis.MS_LS_EMITTER;

export function useOptionalLocalStorage<T>(
  key: string,
  initialValue?: T,
  disabled?: boolean,
) {
  const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);
  const [localStorageValue, setLocalStorageValue] = useLocalStorage(
    key,
    initialValue,
  );

  if (disabled) {
    return [storedValue, setStoredValue] as const;
  }
  return [localStorageValue, setLocalStorageValue] as const;
}

export function useLocalStorage<T>(key: string, initialValue?: T) {
  const lastStoredValue = useRef<string>();

  if (!lastStoredValue.current && typeof initialValue !== "undefined") {
    lastStoredValue.current = JSON.stringify(initialValue);
  }

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (
        typeof window === "undefined" ||
        typeof window.localStorage === "undefined"
      ) {
        return initialValue as T;
      }
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      if (typeof item !== "undefined" && item !== null) {
        lastStoredValue.current = item;
      }
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue as T;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: ((prev: T) => T) | T) => {
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.localStorage !== "undefined"
      ) {
        let prev = initialValue;
        try {
          prev =
            typeof lastStoredValue.current === "undefined"
              ? initialValue
              : JSON.parse(lastStoredValue.current);
        } catch (e) {}

        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(prev as any) : value;

        // Save state
        setStoredValue(valueToStore);
        const valueJson = JSON.stringify(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, valueJson);
        if (valueJson !== lastStoredValue.current) {
          // Store last changed value.
          lastStoredValue.current = valueJson;
          // Emit change for other hooks.
          lsEmitter.emit(`change:${key}`, { valueJson });
        }
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  // Detect adjacent hook changes.
  useEffect(() => {
    const listener: any = ({ valueJson }: { valueJson: string | null }) => {
      if (valueJson && valueJson !== lastStoredValue.current) {
        try {
          setStoredValue(JSON.parse(valueJson));
          lastStoredValue.current = valueJson;
        } catch (e) {
          // unknown error.
        }
      }
    };

    lsEmitter.on(`change:${key}`, listener);

    return () => {
      lsEmitter.off(`change:${key}`, listener);
    };
  }, [key]);

  return [storedValue, setValue, lastStoredValue] as const;
}
