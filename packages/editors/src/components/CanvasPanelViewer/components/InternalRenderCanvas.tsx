import type { BoxStyle } from "@atlas-viewer/atlas";
import { IIIFMediaPlayer } from "@manifest-editor/components";
import type { ReactNode } from "react";
import {
  CanvasWorldObject,
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
  type SVGTheme,
} from "react-iiif-vault";

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
  const keepCanvasScale = false;

  return (
    <>
      <CanvasWorldObject keepCanvasScale={keepCanvasScale} x={x} y={y}>
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
        <RenderAnnotationEditing theme={svgTheme}>{annotationPopup}</RenderAnnotationEditing>
        {children}
      </CanvasWorldObject>
      <RenderAccompanyingCanvas />
    </>
  );
}
