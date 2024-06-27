import { AnnotationNormalized, CanvasNormalized, IIIFExternalWebResource } from "@iiif/presentation-3";
import { Vault } from "@iiif/helpers/vault";
import { emptyAnnotation } from "@iiif/parser";
import { v4 } from "uuid";
import invariant from "tiny-invariant";
import { importEntities, addReference } from "@iiif/helpers/vault/actions";
import { centerRectangles } from "@/helpers/center-rectangles";
import { addMappings, modifyEntityField } from "@iiif/helpers/vault/actions";

export function addPaintingAnnotationToCanvas(
  vault: Vault,
  canvas: CanvasNormalized,
  resourceInformation: IIIFExternalWebResource
) {
  invariant(resourceInformation.id, "Painting annotation body must have an id");
  if (!resourceInformation.duration) {
    invariant(resourceInformation.width, "Painting annotation body must have width");
    invariant(resourceInformation.height, "Painting annotation body must have height");
  }
  invariant(canvas.items[0], "Invalid canvas");

  const annotationPage = canvas.items[0];

  // Position in the middle of the canvas
  // Maintain aspect ratio using annotation body
  const imagePosition =
    resourceInformation.width && resourceInformation.height
      ? centerRectangles(
          canvas,
          {
            width: resourceInformation.width,
            height: resourceInformation.height,
          },
          0.6
        )
      : null;

  const xywh = imagePosition
    ? [~~imagePosition.x, ~~imagePosition.y, ~~imagePosition.width, ~~imagePosition.height]
    : null;
  const annotation: AnnotationNormalized = {
    ...emptyAnnotation,
    motivation: ["painting"],
    id: `vault://annotation/${v4()}`,
    body: [{ id: resourceInformation.id, type: "ContentResource" }],
    target: xywh ? `${canvas.id}#xywh=${xywh.join(",")}` : canvas.id,
  };

  vault.batch((v) => {
    invariant(resourceInformation.id);

    if (!canvas.duration && resourceInformation.duration) {
      v.dispatch(
        modifyEntityField({
          id: canvas.id,
          type: "Canvas",
          value: resourceInformation.duration,
          key: "duration",
        })
      );
    }

    // Import new entities.
    v.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [resourceInformation.id]: resourceInformation,
          },
          Annotation: {
            [annotation.id]: annotation,
          },
        },
      })
    );
    // Add to canvas.
    v.dispatch(
      addReference({
        type: "AnnotationPage",
        id: annotationPage.id,
        key: "items",
        reference: { id: annotation.id, type: "Annotation" },
      })
    );
    v.dispatch(
      addMappings({
        mapping: {
          [annotation.id]: "Annotation",
          [resourceInformation.id]: "ContentResource",
        },
      })
    );
  });
}
