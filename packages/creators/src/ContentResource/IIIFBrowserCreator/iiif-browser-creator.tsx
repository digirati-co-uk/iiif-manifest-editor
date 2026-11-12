import { type ContentState, normaliseContentState, parseContentState, Vault } from "@iiif/helpers";
import { canonicalServiceUrl, getImageServices, isImageService } from "@iiif/parser/image-3";
import type { Canvas } from "@iiif/presentation-3";
import type { CreatorFunctionContext } from "@manifest-editor/creator-api";
import { lazy } from "react";
import invariant from "tiny-invariant";
import { importManifestMetadata, type ManifestMetadataConfig } from "./manifest-metadata";
import { browserImageApiSelector, browserTransformDimensions, type IIIFBrowserOutputItem } from "./iiif-browser-output";

export function croppedRegion(
  imageServiceId: string,
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  size: string,
  rotation: number | string = 0
) {
  return `${imageServiceId}/${Math.floor(region.x)},${Math.floor(region.y)},${Math.floor(region.width)},${Math.floor(
    region.height
  )}/${size}/${rotation}/default.jpg`;
}

export interface IIIFBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: IIIFBrowserOutputItem[];
  /** Observe the selected full canvas, including timed media and accompanying content. */
  trackCanvas?: (canvas: Canvas) => void;
  trackSize?: (dimensions: { width: number; height: number }) => void;
  trackManifest?: (manifest: { requiredStatement: any; rights: any; metadata?: any[]; partOf: any[] }) => void;
}

export async function createFromIIIFBrowserOutput(data: IIIFBrowserCreatorPayload, ctx: CreatorFunctionContext) {
  const targetType = ctx.options.targetType as "Annotation" | "Canvas" | "ContentResource";
  const resources = data.output;

  const returnResources: any[] = [];

  for (const { resource, selector, parent, rotation } of resources) {
    const type = resource.type;
    const previewVault = new Vault();

    if (isImageService(resource) || type === "ImageService") {
      const service = isImageService(resource)
        ? resource
        : await fetch(canonicalServiceUrl(resource.id)).then((response) => {
            if (!response.ok) throw new Error("Could not load the image service");
            return response.json();
          });
      let body = await ctx.create(
        "@manifest-editor/image-service-creator",
        { url: resource.id, service },
        { targetType: "ContentResource" }
      );
      const dimensions = browserTransformDimensions(
        selector?.type === "BoxSelector"
          ? { width: Math.floor(selector.spatial.width), height: Math.floor(selector.spatial.height) }
          : { width: service.width, height: service.height },
        rotation
      );
      data.trackSize?.(dimensions);
      const imageApiSelector = browserImageApiSelector(selector, rotation);
      if (imageApiSelector) {
        body = ctx.embed({ type: "SpecificResource", source: body, selector: imageApiSelector });
      }
      if (targetType === "ContentResource") {
        returnResources.push(body);
        continue;
      }
      const canvasId = targetType === "Canvas" ? ctx.generateId("Canvas") : undefined;
      const annotation = ctx.embed({
        id: ctx.generateId("Annotation"),
        type: "Annotation",
        motivation: "painting",
        body,
        target: canvasId ?? ctx.getTarget(),
      });
      returnResources.push(
        targetType === "Canvas"
          ? ctx.embed({
              id: canvasId,
              type: "Canvas",
              label: resource.label || { en: ["Untitled canvas"] },
              ...dimensions,
              items: [ctx.embed({ id: ctx.generateId("AnnotationPage"), type: "AnnotationPage", items: [annotation] })],
            })
          : annotation
      );
      continue;
    }

    // Case 1 - we want the WHOLE canvas to come across.
    if (targetType === "Canvas" || targetType === "Annotation" || targetType === "ContentResource") {
      // Then we should have gotten eit

      if (type === "Canvas") {
        const canvasId = resource.id;
        const manifestId = parent?.type === "Manifest" ? parent.id : undefined;
        invariant(manifestId, "Could not find Manifest");

        const existingManifest = previewVault.get({
          id: manifestId,
          type: "Manifest",
        });
        // 1st. Check the preview vault.
        const manifest = existingManifest || (await previewVault.loadManifest(manifestId));

        invariant(manifest, "Manifest not found");

        const addManifestMetadataToCanvas = ctx.config.addManifestMetadataToCanvas !== false;
        const imported = importManifestMetadata(manifest, ctx.config as ManifestMetadataConfig);
        data.trackManifest?.({
          requiredStatement: imported.requiredStatement,
          rights: manifest.rights,
          ...(addManifestMetadataToCanvas ? { metadata: imported.metadata } : {}),
          partOf: [{ id: manifestId, type: "Manifest", label: manifest.label }],
        });
        const addManifestTracking = (resource: any): any => {
          if (resource.type === "SpecificResource" && resource.source) {
            return {
              ...resource,
              source: addManifestTracking(resource.source),
            };
          }
          const hasStatement = Object.values(resource.requiredStatement?.value || {}).some((values: any) =>
            values.some((value: string) => value.trim().length > 0)
          );
          const resourceImport = hasStatement
            ? importManifestMetadata(
                { ...manifest, requiredStatement: resource.requiredStatement },
                ctx.config as ManifestMetadataConfig
              )
            : imported;
          const sourceMetadata = resource.metadata || [];
          const copyMetadata = resource.type !== "Canvas" || addManifestMetadataToCanvas;
          const metadata = copyMetadata
            ? [
                ...sourceMetadata,
                ...resourceImport.metadata.filter(
                  (item) => !sourceMetadata.some((existing: any) => JSON.stringify(existing) === JSON.stringify(item))
                ),
              ]
            : sourceMetadata;

          return {
            rights: manifest.rights,
            ...resource,
            requiredStatement: hasStatement ? resource.requiredStatement : imported.requiredStatement,
            ...(copyMetadata ? { metadata } : {}),
            partOf: [
              ...(resource.partOf || []).filter((item: any) => item.id !== manifestId),
              { id: manifestId, type: "Manifest", label: manifest.label },
            ],
          };
        };

        const canvasRef = manifest.items.find((item) => item.id === canvasId);

        invariant(canvasRef, "Canvas not found");

        const canvas = previewVault.get(canvasRef);
        // Track the same effective metadata as a whole-canvas import, including Canvas-specific credits.
        data.trackCanvas?.(addManifestTracking(previewVault.toPresentation3<Canvas>(canvas)!));

        const imageApiSelector = browserImageApiSelector(selector, rotation);

        if (targetType === "Canvas" && !imageApiSelector) {
          const fullCanvas = previewVault.toPresentation3<Canvas>(canvas)!;
          if (!fullCanvas.label) {
            fullCanvas.label = { en: ["Untitled canvas"] };
          }

          // Load before embedding.
          ctx.vault.loadSync(fullCanvas.id, addManifestTracking(fullCanvas));
          // Embed the loaded canvas so empty defaults do not overwrite its content on commit.
          returnResources.push(ctx.embed(ctx.vault.get({ id: fullCanvas.id, type: "Canvas" })));
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
          if (imageApiSelector) {
            // Preserve the existing cropped request URL when a region exists.
            const newBody = { ...fullAnnotation.body };
            let thumbnailId = "";
            // Cropped id.
            if (service && selector?.type === "BoxSelector") {
              const id = service.id || service["@id"] || "";
              if (id) {
                newBody.id = croppedRegion(id, selector.spatial, "max", rotation);
                thumbnailId = croppedRegion(id, selector.spatial, "512,", rotation);
              }
            }
            // Generate cropped image URL.

            fullAnnotation.body = {
              id: ctx.generateId("SpecificResource", annotation),
              type: "SpecificResource",
              source: newBody,
              selector: imageApiSelector,
            };

            const transformedDimensions = browserTransformDimensions(
              selector?.type === "BoxSelector"
                ? {
                    width: ~~selector.spatial.width,
                    height: ~~selector.spatial.height,
                  }
                : dimensions,
              rotation
            );
            if (data.trackSize) {
              data.trackSize(transformedDimensions);
            }

            if (targetType === "ContentResource") {
              returnResources.push(addManifestTracking(fullAnnotation.body));
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

              const { width, height } = transformedDimensions;

              returnResources.push(
                ctx.embed(
                  addManifestTracking({
                    id: canvasId,
                    type: "Canvas",
                    label: { en: ["Untitled canvas"] },
                    width,
                    height,
                    thumbnail: thumbnailId
                      ? [
                          ctx.embed({
                            id: thumbnailId,
                            type: "Image",
                            format: "image/jpeg",
                            width: 512,
                            height: Math.round((height / width) * 512),
                          }),
                        ]
                      : undefined,
                    items: [annotationPage],
                  })
                )
              );
              continue;
            }

            returnResources.push(
              ctx.embed(
                addManifestTracking({
                  ...fullAnnotation,
                  target: ctx.getTarget(),
                })
              )
            );
            continue;
          }

          // @todo check return types (At the moment only annotation is supported.)

          returnResources.push(
            ctx.embed(
              addManifestTracking({
                ...fullAnnotation,
                target: ctx.getTarget(),
              })
            )
          );
        }
      }
    }
  }

  return returnResources;
}
export const IIIFBrowserCreatorForm = lazy(() => import("./iiif-browser-form.lazy"));
