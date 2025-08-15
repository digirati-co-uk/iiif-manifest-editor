import { useGenericEditor } from "@manifest-editor/shell";
import { useAnnotation } from "react-iiif-vault";
import { AtlasRenderBoxSelector } from "./AtlasRenderBoxSelector";
import { AtlasRenderSVGSelector } from "./AtlasRenderSVGSelector";

export function ViewerAnnotation() {
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation);
  const target = editor.annotation.target.getParsedSelector();

  if (!target || !annotation) return null;

  if (target.type === "BoxSelector") {
    return <AtlasRenderBoxSelector id={annotation.id} target={target} />;
  }

  if (target.type === "SvgSelector") {
    return <AtlasRenderSVGSelector id={annotation.id} target={target} />;
  }

  return null;
}
