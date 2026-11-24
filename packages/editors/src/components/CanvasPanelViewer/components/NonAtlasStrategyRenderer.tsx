import { IIIFMediaPlayer } from "@manifest-editor/components";
import { RenderTextualContent } from "@manifest-editor/components";
import { expandTarget } from "@iiif/helpers";
import { useApp } from "@manifest-editor/shell";
import { createContext, useContext, useMemo } from "react";
import {
  getRenderingStrategy,
  StrategyReactContext,
  useCanvas,
  useLoadImageService,
  usePaintables,
  useStrategy,
  useVault,
} from "react-iiif-vault";
import { useInStack } from "../../../helpers";

const SelfContext = createContext<null | React.ReactNode>(null);

export function NonAtlasStrategyRenderer({ children }: { children: React.ReactNode; deps?: any[] }) {
  const canvas = useCanvas();
  const context = useStrategy();
  if (canvas?.duration && context.strategy.type === "unknown") {
    return <StaticTimedCanvasRenderer>{children}</StaticTimedCanvasRenderer>;
  }
  return <StrategyRenderer>{children}</StrategyRenderer>;
}

function StaticTimedCanvasRenderer({ children }: { children: React.ReactNode }) {
  const canvas = useCanvas();
  const context = useStrategy();
  const vault = useVault();
  const [paintables, actions] = usePaintables();
  const [loadImageService] = useLoadImageService();
  const strategy = useMemo(() => {
    if (
      !canvas ||
      paintables.items.some(
        (item) =>
          (item.type !== "image" && item.type !== "textualbody") ||
          expandTarget(item.target).selectors.some((selector) => "temporal" in selector)
      )
    ) {
      return context.strategy;
    }

    // A slideshow duration on a static canvas is its display time, not a media timeline.
    return getRenderingStrategy({
      canvas: { ...canvas, duration: 0 },
      paintables,
      supports: ["images", "textual-content", "empty"],
      loadImageService,
      vault,
    });
  }, [canvas, context.strategy, paintables, loadImageService, vault]);

  return (
    <StrategyReactContext.Provider
      value={{ ...context, strategy, actions: { ...context.actions, ...actions }, choices: paintables.choice }}
    >
      <StrategyRenderer>{children}</StrategyRenderer>
    </StrategyReactContext.Provider>
  );
}

function StrategyRenderer({ children }: { children: React.ReactNode }) {
  const vault = useVault();
  const strategy = useStrategy();
  const canvas = useInStack("Canvas");
  const app = useApp();
  const self = useContext(SelfContext);

  // check canvasEditors on app to see if we have a custom renderer
  const customRenderer = useMemo(() => {
    if (!canvas) return null;
    for (const editor of app.layout.canvasEditors || []) {
      const supportsFn = editor.supports?.strategy;
      if (supportsFn) {
        if (supportsFn(strategy.strategy, canvas, vault)) {
          return editor.component(strategy.strategy);
        }
      }
    }
  }, [canvas, strategy, vault, app.layout.canvasEditors]);

  if (!canvas) {
    return null;
  }

  if (customRenderer) {
    if (self) {
      return self;
    }
    return <SelfContext.Provider value={children}>{customRenderer}</SelfContext.Provider>;
  }

  if (strategy.strategy.type === "textual-content") {
    return <RenderTextualContent strategy={strategy.strategy} />;
  }

  if (strategy.strategy.type === "media" && strategy.strategy.media.type === "Video") {
    return (
      <div className="relative w-full h-full flex">
        <IIIFMediaPlayer canvas={{ id: canvas.resource?.source?.id }} media={strategy.strategy.media as any} />
      </div>
    );
  }

  return children;
}
