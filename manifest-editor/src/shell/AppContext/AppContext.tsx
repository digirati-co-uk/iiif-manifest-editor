import { createContext, ReactNode, SetStateAction, useCallback, useContext, useMemo, useState } from "react";
import { MappedApp } from "../../apps/app-loader";
import { useLocalStorage } from "../../madoc/use-local-storage";
import invariant from "tiny-invariant";

export type AppContext = {
  apps: Record<string, MappedApp>;
  currentApp: { id: string; args?: any };
  changeApp: (app: { id: string; args?: any }) => void;
};

export type AppState = { state: null | any; setState: SetStateAction<any> };

const AppReactContext = createContext<AppContext | null>(null);
const AppStateReactContext = createContext<{ state: null | any; setState: SetStateAction<any> }>({
  state: null,
  setState: () => {
    // no-op
  },
});

export function useApps() {
  const ctx = useContext(AppReactContext);

  invariant(ctx, "Hook useApps must be used inside <AppProvider />");

  return ctx;
}

export function useAppState<S = any>() {
  return useContext(AppStateReactContext);
}

export function AppStateProvider(props: { appId: string; initialValue?: any; children: ReactNode }) {
  const [state, _setState, stateRef] = useLocalStorage(`app-state/${props.appId}`, props.initialValue || {});

  const setState = useCallback((partial: any) => {
    const existing = stateRef.current ? JSON.parse(stateRef.current || "{}") : {};
    const partialState = (typeof partial === "function" ? partial(existing) : partial) || {};

    _setState({
      ...existing,
      ...partialState,
    });
  }, []);

  const ctx = useMemo(() => ({ state: state || {}, setState }), [setState, state]);

  return <AppStateReactContext.Provider value={ctx}>{props.children}</AppStateReactContext.Provider>;
}

export function AppProvider({
  apps,
  initialApp,
  children,
}: {
  apps: Record<string, MappedApp>;
  initialApp?: AppContext["currentApp"];
  children: ReactNode;
}) {
  const [currentApp, changeApp] = useLocalStorage("SelectedApplication", initialApp || { id: "splash" });
  const ctx = useMemo<AppContext>(
    () => ({ currentApp: currentApp || { id: "manifest-editor" }, apps, changeApp }),
    [apps, currentApp]
  );

  return <AppReactContext.Provider value={ctx}>{children}</AppReactContext.Provider>;
}
