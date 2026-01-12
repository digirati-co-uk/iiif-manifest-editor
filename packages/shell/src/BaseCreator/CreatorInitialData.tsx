import { createContext, useContext, useMemo } from "react";

const CreatorInitialDataReactContext = createContext<Record<string, any>>({});

export function useInitialData(id: string) {
  const context = useContext(CreatorInitialDataReactContext);
  return context[id] || {};
}

export function CreatorInitialData(props: { id: string; children: React.ReactNode; data: any }) {
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
