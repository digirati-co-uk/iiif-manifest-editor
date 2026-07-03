import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { useLocalStorage } from "../hooks/use-local-storage";
import { createContext, type ReactNode, type SetStateAction, useCallback, useContext, useEffect, useMemo } from "react";
import invariant from "tiny-invariant";
import type { BackgroundActionDefinition } from "../BackgroundTasks/BackgroundTasks.types";
import { type Config, ConfigProvider } from "../ConfigContext/ConfigContext";
import type {
  AnnotationPanel,
  BackgroundPanel,
  CanvasEditorDefinition,
  EditorDefinition,
  LayoutPanel,
  LayoutProps,
} from "../Layout/Layout.types";
import { useResolvedPluginApp } from "../PluginContext/PluginContext";

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
  preset?: PresetDefinition;
};

export type PresetTemplateConfigurationField = {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select";
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string | number | boolean }>;
};

export type PresetTemplateDefinition = {
  id: string;
  label: string;
  summary: string;
  type: "slideshow" | "fullpage" | "scroll";
  previewUrl: string;
  thumbnailUrl: string;
  configuration?: PresetTemplateConfigurationField[];
};

export type PresetOnboardingRenderContext = {
  templates: PresetTemplateDefinition[];
  selectedTemplateId: string | null;
  selectedTemplate: PresetTemplateDefinition | null;
  setSelectedTemplateId: (id: string | null) => void;
  dismiss: () => void;
};

export type PresetPreviewButtonRenderContext = {
  downloadEnabled?: boolean;
  fileName?: string;
  showOnboardingPreviewHint?: boolean;
  onOnboardingPreviewHintClose?: () => void;
};

export type PresetOnboardingDefinition = {
  id: string;
  mode: "global" | "per-resource";
  title: string;
  summary?: string;
  openLabel?: string;
  dismissLabel?: string;
  primaryLabel?: string;
  renderBody: (ctx: PresetOnboardingRenderContext) => ReactNode;
  renderPreviewButton?: (ctx: PresetPreviewButtonRenderContext) => ReactNode;
};

export type PresetDefinition = {
  onboarding?: PresetOnboardingDefinition;
  templates?: PresetTemplateDefinition[];
};

export interface AppExtension {
  config?: Partial<Config>;
  preset?: PresetDefinition;
  leftPanels?: LayoutPanel[];
  centerPanels?: LayoutPanel[];
  rightPanels?: LayoutPanel[];
  modalPanels?: LayoutPanel[];
  editors?: EditorDefinition[];
  creators?: CreatorDefinition[];
  canvasEditors?: CanvasEditorDefinition[];
  annotations?: AnnotationPanel[];
  background?: BackgroundPanel[];
  backgroundActions?: BackgroundActionDefinition[];
  // Config.
  leftPanelIds?: string[];

  // Side-effects.
  disableSideEffects?: string[];
}

export type AppState = { state: null | any; setState: SetStateAction<any> };

export const PrimeAppReactContext = createContext<MappedApp | null>(null);
export const AppReactContext = createContext<AppContext | null>(null);
export const AppStateReactContext = createContext<{
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

export function getSelectedPresetTemplate(
  templates: PresetTemplateDefinition[],
  selectedTemplateId?: string | null,
) {
  return templates.find((template) => template.id === selectedTemplateId) || null;
}

export function usePresetTemplateSelection() {
  const app = useApp();
  const { state, setState } = useAppState<{ presetTemplateId?: string | null }>();
  const templates = app.preset?.templates || [];
  const selectedTemplateId = typeof state?.presetTemplateId === "string" ? state.presetTemplateId : null;
  const selectedTemplate = useMemo(
    () => getSelectedPresetTemplate(templates, selectedTemplateId),
    [selectedTemplateId, templates],
  );
  const setSelectedTemplateId = useCallback(
    (presetTemplateId: string | null) => setState({ presetTemplateId }),
    [setState],
  );

  return { selectedTemplateId, selectedTemplate, setSelectedTemplateId };
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

  return <AppStateReactContext.Provider value={ctx}>{props.children}</AppStateReactContext.Provider>;
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
  const ctx = useMemo(() => ({ instanceId, appId, args }), [instanceId, appId, args]);
  const _initialState = useMemo(() => initialState || {}, [instanceId]);
  const resolvedDefinition = useResolvedPluginApp(definition, appId);

  // Current App is now put in the "Prime" context.
  return (
    <ConfigProvider config={resolvedDefinition.config || {}}>
      <PrimeAppReactContext.Provider value={resolvedDefinition}>
        <AppReactContext.Provider value={ctx}>
          <AppStateProvider instanceId={ctx.instanceId} appId={ctx.appId} args={ctx.args} initialState={_initialState}>
            {children}
          </AppStateProvider>
        </AppReactContext.Provider>
      </PrimeAppReactContext.Provider>
    </ConfigProvider>
  );
}
