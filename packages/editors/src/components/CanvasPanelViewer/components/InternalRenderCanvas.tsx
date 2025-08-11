import type { BoxStyle } from "@atlas-viewer/atlas";
import { IIIFMediaPlayer } from "@manifest-editor/components";
import { type ReactNode, useContext } from "react";
import {
  CanvasWorldObject,
  ContextBridge,
  type ImageWithOptionalService,
  Render3DModelStrategy,
  RenderAccompanyingCanvas,
  RenderAnnotationEditing,
  RenderAnnotationStrategy,
  RenderAudioStrategy,
  RenderComplexTimelineStrategy,
  RenderEmptyStrategy,
  RenderImageStrategy,
  RenderTextualContentStrategy,
  RenderVideoStrategy,
  RenderYouTubeStrategy,
  StrategyReactContext,
  type SVGTheme,
  useContextBridge,
  useCustomContextBridge,
  useStrategy,
} from "react-iiif-vault";
import { AnnotationEditingTools } from "./AnnotationEditingTools";
import { AnnotationPopupTools } from "./AnnotationPopupTools";
import { RenderContextMenu } from "./RenderContextMenu";
import { RenderCurrentContextMenuItem } from "./RenderCurrentContextMenuItem";

interface InternalRenderCanvasProps {
  x?: number;
  y?: number;
  children?: ReactNode;
  backgroundStyle?: BoxStyle;
  alwaysShowBackground?: boolean;
  enableSizes?: boolean;
  isStatic?: boolean;
  enableYouTube?: boolean;
  onClickPaintingAnnotation?: (id: string, image: ImageWithOptionalService, e: any) => void;
  annotationPopup?: React.ReactNode;
  svgTheme?: Partial<SVGTheme>;
}

export function InternalRenderCanvas({
  x,
  y,
  alwaysShowBackground,
  backgroundStyle,
  enableSizes,
  enableYouTube,
  isStatic,
  onClickPaintingAnnotation,
  children,
  svgTheme,
  annotationPopup,
}: InternalRenderCanvasProps) {
  const strategy = useStrategy();
  const keepCanvasScale = true;
  const bridge = useContextBridge();
  const customBridge = useCustomContextBridge();

  return (
    <>
      <CanvasWorldObject
        renderContextMenu={(data) => (
          <StrategyReactContext.Provider value={strategy}>
            <ContextBridge bridge={bridge} custom={customBridge}>
              <RenderContextMenu {...data} />
            </ContextBridge>
          </StrategyReactContext.Provider>
        )}
        keepCanvasScale={keepCanvasScale}
        x={x}
        y={y}
      >
        <RenderEmptyStrategy alwaysShowBackground={alwaysShowBackground} backgroundStyle={backgroundStyle} />
        <RenderComplexTimelineStrategy />
        <RenderTextualContentStrategy />
        <RenderImageStrategy
          isStatic={isStatic}
          enableSizes={false} // bug in atlas.
          onClickPaintingAnnotation={onClickPaintingAnnotation}
        />
        <RenderAnnotationStrategy />
        <Render3DModelStrategy />
        <RenderAudioStrategy />
        <RenderVideoStrategy as={IIIFMediaPlayer} />
        <RenderYouTubeStrategy />
        <RenderAnnotationEditing theme={svgTheme}>
          {annotationPopup || <AnnotationPopupTools />}
        </RenderAnnotationEditing>
        <RenderCurrentContextMenuItem />
        {children}
      </CanvasWorldObject>
      <RenderAccompanyingCanvas />
    </>
  );
}
