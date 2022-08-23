import { Vault } from "@iiif/vault";
import { AnnotationNormalized, CanvasNormalized, Reference } from "@iiif/presentation-3";
import { SupportedSelectors } from "@iiif/vault-helpers";
import { modifyEntityField } from "@iiif/vault/actions";

export function updateAnnotationSelector(
  vault: Vault,
  annotation: AnnotationNormalized | Reference<"Annotation">,
  target: CanvasNormalized | Reference<"Canvas">,
  selector?: SupportedSelectors
) {
  // Whole canvas.
  if (!selector) {
    vault.dispatch(
      modifyEntityField({
        id: annotation.id,
        type: "Annotation",
        key: "target",
        value: target.id,
      })
    );
    return;
  }

  // @todo expand.
  if (selector.type === "BoxSelector") {
    vault.dispatch(
      modifyEntityField({
        id: annotation.id,
        type: "Annotation",
        key: "target",
        value: `${target.id}#xywh=${selector.spatial.x},${selector.spatial.y},${selector.spatial.width},${selector.spatial.height}`,
      })
    );
    return;
  }
}
