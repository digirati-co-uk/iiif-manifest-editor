import { ModeContext } from "@atlas-viewer/atlas";
import {
  AppReactContext,
  AppStateReactContext,
  AtlasStoreReactContext,
  ContextMenuReactContext,
  LayoutActionsReactContext,
  LayoutStateReactContext,
  PrimeAppReactContext,
  ResourceEditingReactContext,
} from "@manifest-editor/shell";
import { useMemo } from "react";
import { ControlsReactContext, CustomContextBridgeProvider, StrategyReactContext } from "react-iiif-vault";

export function AdditionalContextBridge(props: { children: React.ReactNode }) {
  const contexts = useMemo(() => {
    return {
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
    };
  }, []);

  return <CustomContextBridgeProvider providers={contexts}>{props.children}</CustomContextBridgeProvider>;
}

export function AdditionalContextBridgeInner(props: { children: React.ReactNode }) {
  const contexts = useMemo(() => {
    return {
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
    };
  }, []);

  return <CustomContextBridgeProvider providers={contexts}>{props.children}</CustomContextBridgeProvider>;
}
