import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { useLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";
import {
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import invariant from "tiny-invariant";
import { type Config, ConfigProvider } from "../ConfigContext/ConfigContext";
import type {
  AnnotationPanel,
  CanvasEditorDefinition,
  EditorDefinition,
  LayoutPanel,
  LayoutProps,
} from "../Layout/Layout.types";

export type AppContext = {
  instanceId: string;
  appId: string;
  args?: any;
};

export type LoadedApp = Partial<LayoutProps> & {
  config?: Partial<Config>;
  default: {
    id: string;
    title: string;
    type?: "manifest" | "launcher";
    project?: boolean;
    projectType?: "Manifest" | "Collection";
    dev?: boolean;
    desktop?: boolean;
    web?: boolean;
    drafts?: boolean;
  };
};

export type MappedApp = {
  metadata: LoadedApp["default"];
  layout: LayoutProps;
  config?: Partial<Config>;
};

export interface AppExtension {
  config?: Partial<Config>;
  leftPanels?: LayoutPanel[];
  centerPanels?: LayoutPanel[];
  rightPanels?: LayoutPanel[];
  modalPanels?: LayoutPanel[];
  editors?: EditorDefinition[];
  creators?: CreatorDefinition[];
  canvasEditors?: CanvasEditorDefinition[];
  annotations?: AnnotationPanel[];
  // Config.
  leftPanelIds?: string[];

  // Side-effects.
  disableSideEffects?: string[];
}

export type AppState = { state: null | any; setState: SetStateAction<any> };

export const PrimeAppReactContext = createContext<MappedApp | null>(null);
const AppReactContext = createContext<AppContext | null>(null);
const AppStateReactContext = createContext<{
  state: null | any;
  setState: SetStateAction<any>;
}>({
  state: null,
  setState: () => {
    // no-op
  },
});

export function useAppInstance() {
  const ctx = useContext(AppReactContext);
  invariant(ctx, "Hook useAppInstance must be used inside <AppProvider />");

  return ctx;
}

export function useApp() {
  const app = useContext(PrimeAppReactContext);

  invariant(app, "Hook useApp must be used inside <AppProvider />");

  return app;
}

export function useAppState<S = any>() {
  return useContext(AppStateReactContext);
}

function AppStateProvider(props: {
  instanceId: string;
  appId: string;
  initialState?: any;
  args?: any;
  children: ReactNode;
}) {
  const [state, _setState, stateRef] = useLocalStorage(
    `app-state/${props.appId}/${props.instanceId}`,
    props.initialState || {},
  );

  const setState = useCallback((partial: any) => {
    const existing = stateRef.current
      ? JSON.parse(stateRef.current || "{}")
      : {};
    const partialState =
      (typeof partial === "function" ? partial(existing) : partial) || {};

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

  const ctx = useMemo(
    () => ({ state: state || {}, setState }),
    [setState, state],
  );

  return (
    <AppStateReactContext.Provider value={ctx}>
      {props.children}
    </AppStateReactContext.Provider>
  );
}

export function AppProvider({
  instanceId,
  appId,
  args,
  definition,
  children,
  initialState,
}: {
  initialState?: any;
  instanceId: string;
  appId: string;
  args?: any;
  definition: MappedApp;
  children: ReactNode;
}) {
  const ctx = useMemo(
    () => ({ instanceId, appId, args }),
    [instanceId, appId, args],
  );
  const _initialState = useMemo(() => initialState || {}, [instanceId]);

  // Current App is now put in the "Prime" context.
  return (
    <ConfigProvider config={definition.config || {}}>
      <PrimeAppReactContext.Provider value={definition}>
        <AppReactContext.Provider value={ctx}>
          <AppStateProvider
            instanceId={ctx.instanceId}
            appId={ctx.appId}
            args={ctx.args}
            initialState={_initialState}
          >
            {children}
          </AppStateProvider>
        </AppReactContext.Provider>
      </PrimeAppReactContext.Provider>
    </ConfigProvider>
  );
}
