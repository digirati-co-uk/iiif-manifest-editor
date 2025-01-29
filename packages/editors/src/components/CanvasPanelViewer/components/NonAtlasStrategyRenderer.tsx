import { useCanvas, useStrategy } from "react-iiif-vault";
import { IIIFMediaPlayer } from "@manifest-editor/components";
import { RenderTextualContent } from "@manifest-editor/components";

export function NonAtlasStrategyRenderer({ children }: { children: React.ReactNode }) {
  const strategy = useStrategy();
  const canvas = useCanvas();

  if (strategy.strategy.type === 'textual-content') {
    return <RenderTextualContent strategy={strategy.strategy} />;
  }

  if (strategy.strategy.type === 'media' && strategy.strategy.media.type === 'Video') {
    return (
      <div className="relative w-full h-full flex">
        <IIIFMediaPlayer
          canvas={canvas!}
          media={strategy.strategy.media as any}
        />
      </div>
    );
  }

  return children;
}
