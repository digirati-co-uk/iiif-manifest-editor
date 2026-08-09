import type { Vault4 } from "@iiif/helpers/vault-4";
import { Reference } from "@iiif/presentation-3";
import { AnnotationNormalized, AnnotationPageNormalized, CanvasNormalized } from "@iiif/presentation-3-normalized";
import invariant from "tiny-invariant";
import { removeReference } from "@iiif/helpers/vault/actions";

export function removeAnnotationFromCanvas(
  vault: Vault4,
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
