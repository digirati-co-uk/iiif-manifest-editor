import { createContext, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MappedApp } from "@/apps/app-loader";
import { useLocalStorage, useOptionalLocalStorage } from "@/madoc/use-local-storage";
import invariant from "tiny-invariant";
import { useProjectContext } from "../ProjectContext/ProjectContext";
import { DesktopContext } from "../DesktopContext/DesktopContext";
import qs from "query-string";
import { EditorProject } from "@/shell/ProjectContext/ProjectContext.types";

export type AppContext = {
  apps: Record<string, MappedApp>;
  currentApp: { id: string; args?: any };
  initialApp: { id: string; args?: any };
  changeApp: (app: { id: string; args?: any }) => void;
  editProject: (project: EditorProject) => void;
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

function useCurrentApp(initialApp?: { id: string; args?: any }, enableLocalStorage = false) {
  const s = useAppState();
  const [currentApp, changeApp] = useOptionalLocalStorage(
    "SelectedApplication",
    initialApp || { id: "splash" },
    !enableLocalStorage
  );

  useEffect(() => {
    if ((import.meta.env.DEV || import.meta.env.PULL_REQUEST === "true") && window) {
      const { app, ...args } = qs.parse(window.location.toString().split("?")[1] || "") || {};

      if (app) {
        changeApp({ id: app as string, args });
        if (args) {
          s.setState(args);
        }
      }
    }
  }, []);

  return [currentApp, changeApp] as const;
}

export function AppProvider({
  apps,
  initialApp,
  saveCurrentApp = true,
  children,
}: {
  apps: Record<string, MappedApp>;
  initialApp?: AppContext["currentApp"];
  saveCurrentApp?: boolean;
  children: ReactNode;
}) {
  const [currentApp, changeApp] = useCurrentApp(initialApp, saveCurrentApp);

  const editProject = (project: EditorProject) => {
    if (project.resource.type === "Manifest") {
      changeApp({ id: "manifest-editor" });
    }
    if (project.resource.type === "Collection") {
      changeApp({ id: "collection-editor" });
    }
  };

  const ctx = useMemo<AppContext>(
    () => ({
      currentApp: currentApp || { id: "splash" },
      initialApp: initialApp || { id: "splash" },
      apps,
      changeApp,
      editProject,
    }),
    [initialApp, apps, currentApp]
  );

  return <AppReactContext.Provider value={ctx}>{children}</AppReactContext.Provider>;
}
