import { ChoiceDescription } from "@iiif/helpers";
import { ReactNode, useMemo } from "react";
import { CanvasStrategyProvider, ComplexTimelineStrategy, ControlsReactContext, EmptyStrategy, MediaStrategy, RenderingStrategy, SingleImageStrategy, StrategyActions, useCanvas } from "react-iiif-vault";

interface CustomStrategyProviderProps {
  onChoiceChange?: (choice?: ChoiceDescription) => void;
  registerActions?: (actions: StrategyActions) => void;
  defaultChoices?: Array<{ id: string; opacity?: number }>;
  keepCanvasScale?: boolean;
  strategies?: Array<RenderingStrategy['type']>;
  throwOnUnknown?: boolean;
  renderViewerControls?: (strategy: SingleImageStrategy | EmptyStrategy) => ReactNode;
  viewControlsDeps?: any[];
  renderMediaControls?: (strategy: MediaStrategy) => ReactNode;
  renderComplexTimelineControls?: (strategy: ComplexTimelineStrategy) => ReactNode;
  complexTimelineControlsDeps?: any[];
  mediaControlsDeps?: any[];
  children?: ReactNode;
}

export function CustomStrategyProvider(props: CustomStrategyProviderProps) {
  const canvas = useCanvas()!;
  // biome-ignore lint/correctness/useExhaustiveDependencies: This is a false positive.
  const controls = useMemo(
    () => ({
      renderViewerControls: props.renderViewerControls,
      viewControlsDeps: props.viewControlsDeps,
      renderMediaControls: props.renderMediaControls,
      mediaControlsDeps: props.mediaControlsDeps,
      renderComplexTimelineControls: props.renderComplexTimelineControls,
    }),
    []
  );

  if (!canvas) {
    return null;
  }

  return (
    <ControlsReactContext.Provider value={controls as any}>
      <CanvasStrategyProvider
        throwOnUnknown={props.throwOnUnknown}
        onChoiceChange={props.onChoiceChange}
        registerActions={props.registerActions}
        strategies={props.strategies}
        defaultChoices={props.defaultChoices}
        mediaControlsDeps={props.mediaControlsDeps}
        renderMediaControls={props.renderMediaControls}
        renderViewerControls={props.renderViewerControls}
        renderComplexTimelineControls={props.renderComplexTimelineControls}
        complexTimelineControlsDeps={props.complexTimelineControlsDeps}
        viewControlsDeps={props.viewControlsDeps}
      >
        {props.children}
      </CanvasStrategyProvider>
    </ControlsReactContext.Provider>
  );
}
