import { type BoxSelector, type ContentState, Vault, normaliseContentState, parseContentState } from "@iiif/helpers";
import { canonicalServiceUrl, getImageServices } from "@iiif/parser/image-3";
import type { Canvas } from "@iiif/presentation-3";
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

export interface IIIFBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: Array<{ resource: any; parent: { id: string; type: string } | undefined; selector: BoxSelector | undefined }>;
  trackSize?: (dimensions: { width: number; height: number }) => void;
}

export async function createFromIIIFBrowserOutput(data: IIIFBrowserCreatorPayload, ctx: CreatorFunctionContext) {
  const targetType = ctx.options.targetType as "Annotation" | "Canvas" | "ContentResource";
  const resources = data.output;

  const returnResources: any[] = [];

  for (const { resource, selector, parent } of resources) {
    const type = resource.type;
    const previewVault = new Vault();

    // Case 1 - we want the WHOLE canvas to come across.
    if (targetType === "Canvas" || targetType === "Annotation" || targetType === "ContentResource") {
      // Then we should have gotten eit

      if (type === "Canvas") {
        const canvasId = resource.id;
        const manifestId = parent?.type === "Manifest" ? parent.id : undefined;
        invariant(manifestId, "Could not find Manifest");

        // 1st. Check the preview vault.
        const manifest = await previewVault.loadManifest(manifestId);

        invariant(manifest, "Manifest not found");

        const canvasRef = manifest.items.find((item) => item.id === canvasId);

        invariant(canvasRef, "Canvas not found");

        const canvas = previewVault.get(canvasRef);

        if (targetType === "Canvas" && selector?.type !== "BoxSelector") {
          const fullCanvas = previewVault.toPresentation3<Canvas>(canvas)!;
          if (!fullCanvas.label) {
            fullCanvas.label = { en: ["Untitled canvas"] };
          }
          // Load before embedding.
          ctx.vault.loadSync(fullCanvas.id, fullCanvas);
          // Then embed.
          returnResources.push(ctx.embed(fullCanvas));
          continue;
        }

        const annotationPage = previewVault.get(canvas.items[0]!);
        const annotation = previewVault.get(annotationPage.items[0]!);
        if (targetType === "Annotation" || targetType === "Canvas" || targetType === "ContentResource") {
          const fullAnnotation = previewVault.toPresentation3<any>(annotation);
          fullAnnotation.id = ctx.generateId("Annotation");

          let service = null;

          const dimensions = { width: 0, height: 0 };

          if (fullAnnotation?.body?.service) {
            const width = fullAnnotation?.body.width;
            const height = fullAnnotation?.body.height;
            service = getImageServices(fullAnnotation?.body)[0];

            if (service && (!service.width || !service.height)) {
              service.width = width;
              service.height = height;
            }

            dimensions.width = width;
            dimensions.height = height;
            if (data.trackSize) {
              data.trackSize(dimensions);
            }
          }

          // Check for selector on state.
          if (selector?.type === "BoxSelector") {
            const imageApiSelector = {
              "@context": "http://iiif.io/api/annex/openannotation/context.json",
              type: "iiif:ImageApiSelector",
              region: [
                ~~selector.spatial.x,
                ~~selector.spatial.y,
                ~~selector.spatial.width,
                ~~selector.spatial.height,
              ].join(","),
            };

            // Change the body ID to be the cropped image.
            const newBody = { ...fullAnnotation.body };
            let thumbnailId = "";
            // Cropped id.
            if (service) {
              const id = service.id || service["@id"] || "";
              if (id) {
                newBody.id = croppedRegion(id, selector.spatial, "max");
                thumbnailId = croppedRegion(id, selector.spatial, "512,");
              }
            }
            // Generate cropped image URL.

            fullAnnotation.body = {
              id: ctx.generateId("SpecificResource", annotation),
              type: "SpecificResource",
              source: newBody,
              selector: imageApiSelector,
            };

            if (data.trackSize) {
              data.trackSize({
                width: ~~selector.spatial.width,
                height: ~~selector.spatial.height,
              });
            }

            if (targetType === "ContentResource") {
              returnResources.push(fullAnnotation.body);
              continue;
            }

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

              returnResources.push(
                ctx.embed({
                  id: canvasId,
                  type: "Canvas",
                  label: { en: ["Untitled canvas"] },
                  width: ~~selector.spatial.width,
                  height: ~~selector.spatial.height,
                  thumbnail: thumbnailId
                    ? [
                        ctx.embed({
                          id: thumbnailId,
                          type: "Image",
                          format: "image/jpeg",
                          width: 512,
                          height: Math.round((selector.spatial.height / selector.spatial.width) * 512),
                        }),
                      ]
                    : undefined,
                  items: [annotationPage],
                }),
              );
              continue;
            }

            returnResources.push(
              ctx.embed({
                ...fullAnnotation,
                target: ctx.getTarget(),
              }),
            );
            continue;
          }

          returnResources.push(
            ctx.embed({
              ...previewVault.toPresentation3(annotation),
              target: ctx.getTarget(),
            }),
          );
        }
      }
    }
  }

  return returnResources;
}
export const IIIFBrowserCreatorForm = lazy(() => import("./iiif-browser-form.lazy"));
