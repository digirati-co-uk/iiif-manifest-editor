import { createContext, useContext, useMemo } from "react";

const CreatorInitialDataReactContext = createContext<Record<string, unknown>>({});

export function useInitialData<T = unknown>(id: string): T | {} {
  const context = useContext(CreatorInitialDataReactContext);
  return context[id] || {};
}

export function CreatorInitialData<T extends Record<string, unknown>>(props: { id: string; children: React.ReactNode; data: T }) {
  const existingContext = useContext(CreatorInitialDataReactContext);
  const newContext = useMemo(
    () => ({ ...existingContext, [props.id]: props.data }),
    [existingContext, props.id, props.data],
  );
  return (
    <CreatorInitialDataReactContext.Provider value={newContext}>
      {props.children}
    </CreatorInitialDataReactContext.Provider>
  );
}
