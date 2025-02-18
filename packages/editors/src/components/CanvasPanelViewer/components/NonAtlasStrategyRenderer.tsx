import { IIIFMediaPlayer } from "@manifest-editor/components";
import { RenderTextualContent } from "@manifest-editor/components";
import { useApp } from "@manifest-editor/shell";
import { createContext, useContext, useMemo } from "react";
import { useCanvas, useStrategy, useVault } from "react-iiif-vault";
import { useInStack } from "../../../helpers";

const SelfContext = createContext<any>(null);

export function NonAtlasStrategyRenderer({
  children,
}: { children: React.ReactNode }) {
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
  }, [canvas, strategy]);

  if (!canvas) {
    return null;
  }

  if (customRenderer) {
    if (self) {
      return self;
    }
    return (
      <SelfContext.Provider value={children}>
        {customRenderer}
      </SelfContext.Provider>
    );
  }

  if (strategy.strategy.type === "textual-content") {
    return <RenderTextualContent strategy={strategy.strategy} />;
  }

  if (
    strategy.strategy.type === "media" &&
    strategy.strategy.media.type === "Video"
  ) {
    return (
      <div className="relative w-full h-full flex">
        <IIIFMediaPlayer
          canvas={{ id: canvas.resource?.source?.id }}
          media={strategy.strategy.media as any}
        />
      </div>
    );
  }

  return children;
}
