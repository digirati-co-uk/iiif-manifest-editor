import { useMemo } from "react";
import { StrategyReactContext, ControlsReactContext, CustomContextBridgeProvider } from "react-iiif-vault";

export function AdditionalContextBridge(props: { children: React.ReactNode }) {
  const contexts = useMemo(() => {
    return {
      strategy: StrategyReactContext,
      controls: ControlsReactContext
    };
  }, [])

  return (
    <CustomContextBridgeProvider providers={contexts}>
      {props.children}
    </CustomContextBridgeProvider>
  );
}

export function AdditionalContextBridgeInner(props: { children: React.ReactNode }) {
  const contexts = useMemo(() => {
    return {
      strategy: StrategyReactContext,
      controls: ControlsReactContext
    };
  }, []);

  return (
    <CustomContextBridgeProvider providers={contexts}>
      {props.children}
    </CustomContextBridgeProvider>
  );
}
