(globalThis as any).global = {};
(globalThis as any).global.setImmediate = (fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args);
