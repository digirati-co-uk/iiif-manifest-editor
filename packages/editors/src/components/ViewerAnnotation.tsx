import { AtlasRenderBoxSelector } from "./AtlasRenderBoxSelector";
import { AtlasRenderSVGSelector } from "./AtlasRenderSVGSelector";
import { useViewerAnnotationTarget } from "./useViewerAnnotationTarget";

export function ViewerAnnotation({ style }: { style?: any }) {
  const { annotation, editor, target } = useViewerAnnotationTarget();

  if (!target || !annotation) return null;

  // Overlay any styling defined via the target's `styleClass` (e.g. a border
  // colour) on top of the provided base style, so the preview reflects it.
  const boxStyle = editor.annotation.target.getBoxStyle();
  const mergedStyle = Object.keys(boxStyle).length ? { ...(style || {}), ...boxStyle } : style;

  if (target.type === "BoxSelector") {
    return <AtlasRenderBoxSelector id={annotation.id} target={target} style={mergedStyle} />;
  }

  if (target.type === "SvgSelector") {
    return <AtlasRenderSVGSelector id={annotation.id} target={target} style={mergedStyle} />;
  }

  return null;
}
