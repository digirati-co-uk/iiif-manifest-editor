import { Vault } from "@iiif/vault";
import { AnnotationNormalized, AnnotationPageNormalized, CanvasNormalized, Reference } from "@iiif/presentation-3";
import invariant from "tiny-invariant";
import { removeReference } from "@iiif/vault/actions";

export function removeAnnotationFromCanvas(
  vault: Vault,
  canvasRef: CanvasNormalized | Reference<"Canvas">,
  annotationRef: AnnotationNormalized | Reference<"Annotation">
) {
  const canvas = vault.get<CanvasNormalized>(canvasRef);

  invariant(canvas, "Canvas not found");

  const annotationPages = vault.get<AnnotationPageNormalized>(canvas.items);
  const foundPage = annotationPages.find((page) => {
    return page.items.find((item) => item.id === annotationRef.id);
  });

  invariant(foundPage, "Annotation found inside canvas");

  vault.dispatch(
    removeReference({
      id: foundPage.id,
      type: "AnnotationPage",
      key: "items",
      reference: { id: annotationRef.id, type: "Annotation" },
    })
  );
}
