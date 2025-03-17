import {
  useCanvas,
  RenderAudioStrategy,
  RenderEmptyStrategy,
  RenderImageStrategy,
  RenderVideoStrategy,
  Render3DModelStrategy,
  RenderAnnotationStrategy,
  RenderComplexTimelineStrategy,
  RenderTextualContentStrategy,
  RenderYouTubeStrategy,
  RenderAccompanyingCanvas,
  CanvasWorldObject,
  ImageWithOptionalService,
  useStrategy,
} from "react-iiif-vault";
import { ReactNode, useMemo } from "react";
import { IIIFMediaPlayer } from '@manifest-editor/components';
import { BoxStyle } from "@atlas-viewer/atlas";


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
}: InternalRenderCanvasProps) {
  const keepCanvasScale = false;

  return (
    <>
      <CanvasWorldObject keepCanvasScale={keepCanvasScale} x={x} y={y}>
        <RenderEmptyStrategy
          alwaysShowBackground={alwaysShowBackground}
          backgroundStyle={backgroundStyle}
        />
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
        {children}
      </CanvasWorldObject>
      <RenderAccompanyingCanvas />
    </>
  );
}
