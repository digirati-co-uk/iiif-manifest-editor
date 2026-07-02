import { useGenericEditor } from "@manifest-editor/shell";
import { useMemo } from "react";
import { useAnnotation } from "react-iiif-vault";
import { AtlasRenderBoxSelector } from "./AtlasRenderBoxSelector";
import { AtlasRenderSVGSelector } from "./AtlasRenderSVGSelector";

export function ViewerAnnotation({ style }: { style?: any }) {
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation);
  const target = editor.annotation.target.getParsedSelector();

  if (!target || !annotation) return null;

  // Overlay any styling defined via the target's `styleClass` (e.g. a border
  // colour) on top of the provided base style, so the preview reflects it.
  const boxStyle = editor.annotation.target.getBoxStyle();
  const mergedStyle = useMemo(
    () => (Object.keys(boxStyle).length ? { ...(style || {}), ...boxStyle } : style),
    [boxStyle, style],
  );

  if (target.type === "BoxSelector") {
    return <AtlasRenderBoxSelector id={annotation.id} target={target} style={mergedStyle} />;
  }

  if (target.type === "SvgSelector") {
    return <AtlasRenderSVGSelector id={annotation.id} target={target} style={mergedStyle} />;
  }

  return null;
}
