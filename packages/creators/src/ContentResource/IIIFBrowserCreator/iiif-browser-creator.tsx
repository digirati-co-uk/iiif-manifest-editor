import {
  type ContentState,
  Vault,
  normaliseContentState,
  parseContentState,
} from "@iiif/helpers";
import { canonicalServiceUrl, getImageServices } from "@iiif/parser/image-3";
import type { CreatorFunctionContext } from "@manifest-editor/creator-api";
import { lazy } from "react";
import invariant from "tiny-invariant";

function croppedRegion(
  imageServiceId: string,
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  size: string,
) {
  return `${imageServiceId}/${Math.floor(region.x)},${Math.floor(region.y)},${Math.floor(region.width)},${Math.floor(
    region.height,
  )}/${size}/0/default.jpg`;
}

interface IIIFBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: string | ContentState | ContentState[];
}

export async function createFromIIIFBrowserOutput(
  data: IIIFBrowserCreatorPayload,
  ctx: CreatorFunctionContext,
) {
  const targetType = ctx.options.targetType as
    | "Annotation"
    | "Canvas"
    | "ContentResource";

  // For now..
  if (Array.isArray(data.output)) {
    throw new Error("Multiple items not yet supported");
  }

  const contentState = normaliseContentState(
    typeof data.output === "string"
      ? parseContentState(data.output)
      : data.output,
  );

  console.log("Adding from content state", contentState);

  if (!contentState.target || contentState.target.length === 0) {
    throw new Error("No target found in content state");
  }

  const target = contentState.target[0]!;
  const type = target.source.type;
  const previewVault = new Vault();

  // Case 1 - we want the WHOLE canvas to come across.
  if (targetType === "Canvas" || targetType === "Annotation") {
    // Then we should have gotten eit

    if (type === "Canvas") {
      const canvasId = target.source.id;
      const manifestId = target.source.partOf?.find(
        (t) => t.type === "Manifest",
      );
      invariant(manifestId, "Could not load external resource without partOf");

      // 1st. Check the preview vault.
      const manifest = await previewVault.loadManifest(manifestId);

      invariant(manifest, "Manifest not found");

      const canvasRef = manifest.items.find((item) => item.id === canvasId);

      invariant(canvasRef, "Canvas not found");

      const canvas = previewVault.get(canvasRef);

      if (targetType === "Canvas" && target.selector?.type !== "BoxSelector") {
        return ctx.embed(previewVault.toPresentation3(canvas));
      }

      const annotationPage = previewVault.get(canvas.items[0]!);
      const annotation = previewVault.get(annotationPage.items[0]!);
      if (targetType === "Annotation" || targetType === "Canvas") {
        const fullAnnotation = previewVault.toPresentation3<any>(annotation);
        fullAnnotation.id = ctx.generateId("Annotation");

        let service = null;

        if (fullAnnotation?.body?.service) {
          const width = fullAnnotation?.body.width;
          const height = fullAnnotation?.body.height;
          service = getImageServices(fullAnnotation?.body)[0];

          if (service && (!service.width || !service.height)) {
            service.width = width;
            service.height = height;
          }
        }

        // Check for selector on state.
        if (target.selector && target.selector.type === "BoxSelector") {
          const selector = {
            "@context": "http://iiif.io/api/annex/openannotation/context.json",
            type: "iiif:ImageApiSelector",
            region: [
              ~~target.selector.spatial.x,
              ~~target.selector.spatial.y,
              ~~target.selector.spatial.width,
              ~~target.selector.spatial.height,
            ].join(","),
          };

          // Change the body ID to be the cropped image.
          const newBody = { ...fullAnnotation.body };
          let thumbnailId = "";
          // Cropped id.
          if (service) {
            const id = service.id || service["@id"] || "";
            if (id) {
              newBody.id = croppedRegion(id, target.selector.spatial, "max");
              thumbnailId = croppedRegion(id, target.selector.spatial, "512,");
            }
          }
          // Generate cropped image URL.

          fullAnnotation.body = {
            id: ctx.generateId("SpecificResource", annotation),
            type: "SpecificResource",
            source: newBody,
            selector,
          };

          // Canvas.
          if (targetType === "Canvas") {
            const canvasId = ctx.generateId("Canvas", annotation);
            fullAnnotation.target = canvasId;
            // Page then canvas.
            const pageId = ctx.generateId("Page", annotation);
            const annotationPage = ctx.embed({
              id: pageId,
              type: "AnnotationPage",
              items: [fullAnnotation],
            });

            return ctx.embed({
              id: canvasId,
              type: "Canvas",
              width: ~~target.selector.spatial.width,
              height: ~~target.selector.spatial.height,
              thumbnail: thumbnailId
                ? [
                    ctx.embed({
                      id: thumbnailId,
                      type: "Image",
                      format: "image/jpeg",
                      width: 512,
                      height: Math.round(
                        (target.selector.spatial.height /
                          target.selector.spatial.width) *
                          512,
                      ),
                    }),
                  ]
                : undefined,
              items: [annotationPage],
            });
          }

          return ctx.embed({
            ...fullAnnotation,
            target: ctx.getTarget(),
          });
        }

        return ctx.embed({
          ...previewVault.toPresentation3(annotation),
          target: ctx.getTarget(),
        });
      }
    }
  }

  throw new Error("Not yet supported.");
  // @todo
  // 3 output options
  // - Content resource / single thing (image + service)
  // - Annotation (extracted from browser resource OR new blank one)
  // - Canvas (extracted from browser resource OR new blank one)
  // + There's a cropping aspect that might be applied.
}
export const IIIFBrowserCreatorForm = lazy(
  () => import("./iiif-browser-form.lazy"),
);
