import { AnnotationPreview, CanvasTargetContext } from "@manifest-editor/editors";
import { useLayoutActions } from "@manifest-editor/shell";
import { LocaleString, useAnnotation, useAtlasStore, useCanvas } from "react-iiif-vault";
import { useStore } from "zustand";

export function RenderPaintingAnnotationPreview() {
  const annotation = useAnnotation();
  const canvas = useCanvas();
  const store = useAtlasStore();
  const { edit } = useLayoutActions();
  const viewport = useStore(store, (s) => (canvas?.id ? s.canvasViewports[canvas.id] : null));

  if (!annotation || !canvas || !viewport) return null;

  return (
    <div className="p-2">
      <LocaleString
        as="div"
        defaultText={(<span className="opacity-50">Untitled</span>) as any}
        className="whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden"
      >
        {annotation?.label}
      </LocaleString>
      <LocaleString className="text-gray-500 text-sm bg-white line-clamp-2 mb-4" as="div">
        {annotation?.summary}
      </LocaleString>
      <CanvasTargetContext>
        <AnnotationPreview viewport={viewport} onClick={() => edit(annotation, undefined, { forceOpen: true })} />
      </CanvasTargetContext>
    </div>
  );
}
