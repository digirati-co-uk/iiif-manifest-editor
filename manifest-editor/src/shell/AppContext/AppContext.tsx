import { createContext, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MappedApp } from "../../apps/app-loader";
import { useLocalStorage } from "../../madoc/use-local-storage";
import invariant from "tiny-invariant";
import { useCurrentProject, useProjectContext } from "../ProjectContext/ProjectContext";
import { DesktopContext } from "../DesktopContext/DesktopContext";
import qs from "query-string";

export type AppContext = {
  apps: Record<string, MappedApp>;
  currentApp: { id: string; args?: any };
  initialApp: { id: string; args?: any };
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

export function AppStateProvider(props: { appId: string; initialValue?: any; args?: any; children: ReactNode }) {
  const { current } = useProjectContext();
  const [state, _setState, stateRef] = useLocalStorage(`app-state/${current?.id}`, props.initialValue || {});

  const setState = useCallback((partial: any) => {
    const existing = stateRef.current ? JSON.parse(stateRef.current || "{}") : {};
    const partialState = (typeof partial === "function" ? partial(existing) : partial) || {};

    _setState({
      ...existing,
      ...partialState,
    });
  }, []);

  useEffect(() => {
    if (props.args) {
      setState(props.args);
    }
  }, [props.appId]);

  const ctx = useMemo(() => ({ state: state || {}, setState }), [setState, state]);

  return (
    <AppStateReactContext.Provider value={ctx}>
      {window.__TAURI__ ? <DesktopContext>{props.children}</DesktopContext> : props.children}
    </AppStateReactContext.Provider>
  );
}

function useCurrentApp(initialApp?: { id: string; args?: any }) {
  const s = useAppState();
  const [currentApp, changeApp] = useLocalStorage("SelectedApplication", initialApp || { id: "splash" });

  useEffect(() => {
    if (import.meta.env.DEV && window) {
      const { app, ...args } = qs.parse(window.location.toString().split("?")[1] || "") || {};

      if (app) {
        changeApp({ id: app as string, args });
        if (args) {
          console.log("set state", args);
          s.setState(args);
        }
      }
    }
  }, []);

  console.log(s);

  return [currentApp, changeApp] as const;
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
  const [currentApp, changeApp] = useCurrentApp(initialApp);
  const ctx = useMemo<AppContext>(
    () => ({
      currentApp: currentApp || { id: "splash" },
      initialApp: initialApp || { id: "splash" },
      apps,
      changeApp,
    }),
    [initialApp, apps, currentApp]
  );

  return <AppReactContext.Provider value={ctx}>{children}</AppReactContext.Provider>;
}
