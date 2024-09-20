((window as any) || (globalThis as any)).setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
