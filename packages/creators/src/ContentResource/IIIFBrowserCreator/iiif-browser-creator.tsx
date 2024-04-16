import { ContentState, normaliseContentState, parseContentState } from "@iiif/helpers";
import { CreatorFunctionContext } from "@manifest-editor/creator-api";
import { lazy } from "react";
import invariant from "tiny-invariant";

interface IIIFBrowserCreatorPayload {
  // This is the output (JSON) from the IIIF Browser.
  // We could have gone with "IIIF Content State" here and may do in the future, but this
  // will simplify parsing and importing resources.
  output: string | ContentState | ContentState[];
}

export async function createFromIIIFBrowserOutput(data: IIIFBrowserCreatorPayload, ctx: CreatorFunctionContext) {
  const targetType = ctx.options.targetType as "Annotation" | "Canvas" | "ContentResource";

  // For now..
  if (Array.isArray(data.output)) {
    throw new Error("Multiple items not yet supported");
  }

  const contentState = normaliseContentState(
    typeof data.output === "string" ? parseContentState(data.output) : data.output
  );

  if (!contentState.target || contentState.target.length === 0) {
    throw new Error("No target found in content state");
  }

  const target = contentState.target[0]!;
  const type = target.source.type;
  const previewVault = ctx.getPreviewVault();

  // Case 1 - we want the WHOLE canvas to come across.
  if (targetType === "Canvas" || targetType === "Annotation") {
    // Then we should have gotten eit

    if (type === "Canvas") {
      const canvasId = target.source.id;
      const manifestId = target.source.partOf?.find((t) => t.type === "Manifest");
      invariant(manifestId, "Could not load external resource without partOf");

      // 1st. Check the preview vault.
      const manifest = await previewVault.loadManifest(manifestId);

      invariant(manifest, "Manifest not found");

      const canvasRef = manifest.items.find((item) => item.id === canvasId);

      invariant(canvasRef, "Canvas not found");

      const canvas = previewVault.get(canvasRef);

      if (targetType === "Canvas") {
        return ctx.embed(previewVault.toPresentation3(canvas));
      }

      const annotationPage = previewVault.get(canvas.items[0]!);
      const annotation = previewVault.get(annotationPage.items[0]!);
      if (targetType === "Annotation") {
        const fullAnnotation = previewVault.toPresentation3<any>(annotation);

        if (fullAnnotation && fullAnnotation?.body?.service) {
          const width = fullAnnotation?.body.width;
          const height = fullAnnotation?.body.height;
          const service = Array.isArray(fullAnnotation?.body?.service)
            ? fullAnnotation?.body?.service[0]
            : fullAnnotation?.body?.service;

          if (!service.width || !service.height) {
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

          fullAnnotation.body = {
            id: ctx.generateId("SpecificResource", annotation),
            type: "SpecificResource",
            source: fullAnnotation.body,
            selector,
          };

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
export const IIIFBrowserCreatorForm = lazy(() => import("./iiif-browser-form.lazy"));
