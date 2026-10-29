import { EditorI18nBridgeContext } from "../../EditorI18nBridge";
import { useOptionalEditorI18nInstance } from "@manifest-editor/i18n";
import { useContext } from "react";
import { ModeContext } from "@atlas-viewer/atlas";
import {
  AppReactContext,
  AppStateReactContext,
  AtlasStoreReactContext,
  ConfigReactContext,
  ContextMenuReactContext,
  EditingStackContext,
  LayoutActionsReactContext,
  LayoutStateReactContext,
  PrimeAppReactContext,
  ResourceEditingReactContext,
  SaveConfigReactContext,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import { ControlsReactContext, CustomContextBridgeProvider, StrategyReactContext } from "react-iiif-vault";

export function AdditionalContextBridge(props: { children: React.ReactNode }) {
  const inherited = useOptionalEditorI18nInstance();
  const bridged = useContext(EditorI18nBridgeContext);
  const contexts = useMemo(() => {
    return {
      editorI18n: EditorI18nBridgeContext,
      strategy: StrategyReactContext,
      controls: ControlsReactContext,
      mode: ModeContext,
      atlas: AtlasStoreReactContext,
      layout: LayoutStateReactContext,
      resource: ResourceEditingReactContext,
      layoutActions: LayoutActionsReactContext,
      PrimeAppReactContext,
      AppReactContext,
      AppStateReactContext,
      ContextMenuReactContext,
      EditingStackContext,
      ConfigReactContext,
      SaveConfigReactContext,
    };
  }, []);

  return (
    <EditorI18nBridgeContext.Provider value={inherited || bridged}>
      <CustomContextBridgeProvider providers={contexts}>{props.children}</CustomContextBridgeProvider>
    </EditorI18nBridgeContext.Provider>
  );
}

export function AdditionalContextBridgeInner(props: { children: React.ReactNode }) {
  const contexts = useMemo(() => {
    return {
      editorI18n: EditorI18nBridgeContext,
      strategy: StrategyReactContext,
      controls: ControlsReactContext,
      mode: ModeContext,
      atlas: AtlasStoreReactContext,
      layout: LayoutStateReactContext,
      resource: ResourceEditingReactContext,
      layoutActions: LayoutActionsReactContext,
      PrimeAppReactContext,
      AppReactContext,
      AppStateReactContext,
      ContextMenuReactContext,
      EditingStackContext,
    };
  }, []);

  return <CustomContextBridgeProvider providers={contexts}>{props.children}</CustomContextBridgeProvider>;
}
