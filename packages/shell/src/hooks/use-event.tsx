import type { Emitter } from "mitt";
import mitt from "mitt";
import { createContext, useContext, useEffect } from "react";

const events = mitt();

export const ReactEmitterContext = createContext<Emitter<any>>(events);

export function EventEmitterProvider({
  children,
  emitter,
}: { children: React.ReactNode; emitter: Emitter<any> }) {
  return (
    <ReactEmitterContext.Provider value={emitter}>
      {children}
    </ReactEmitterContext.Provider>
  );
}

export function useEmitter<
  Event extends Record<string | symbol, unknown>,
>(): Emitter<Event> {
  return useContext(ReactEmitterContext);
}

export function useEvent<
  Event extends Record<string | symbol, unknown>,
  Key extends keyof Event,
>(key: Key, listener: (data: Event[Key]) => void, deps: any[] = []) {
  const emitter = useContext(ReactEmitterContext);
  useEffect(() => {
    const handler = (data: Event[Key]) => {
      listener(data);
    };
    emitter.on(key as any, handler);
    return () => {
      emitter.off(key as any, handler);
    };
  }, [emitter, key, ...deps]);
}
