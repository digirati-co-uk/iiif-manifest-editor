const hasWorkingLocalStorage =
  typeof globalThis.localStorage === "object" &&
  typeof globalThis.localStorage?.getItem === "function" &&
  typeof globalThis.localStorage?.setItem === "function" &&
  typeof globalThis.localStorage?.removeItem === "function";

if (!hasWorkingLocalStorage) {
  const storage = new Map();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {
      clear() {
        storage.clear();
      },
      getItem(key) {
        const value = storage.get(String(key));
        return value === undefined ? null : value;
      },
      key(index) {
        return Array.from(storage.keys())[index] ?? null;
      },
      get length() {
        return storage.size;
      },
      removeItem(key) {
        storage.delete(String(key));
      },
      setItem(key, value) {
        storage.set(String(key), String(value));
      },
    },
  });
}
