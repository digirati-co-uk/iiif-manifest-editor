import { getImageServices, canonicalServiceUrl } from "@atlas-viewer/iiif-image-api";
import { createPaintingAnnotationsHelper } from "@iiif/helpers";
import { CanvasNormalized } from "@iiif/presentation-3-normalized";
import { ExplorerFormat } from "../IIIFExplorer.types";

export const imageServiceFormat: ExplorerFormat<"image-service"> = {
  label: "Image service",
  format: async (resource, options, vault) => {
    const canvas = vault.get<CanvasNormalized>(resource);
    const painting = createPaintingAnnotationsHelper(vault);
    const paintables = painting.getPaintables(canvas);
    const first = paintables.items[0];

    if (!first) {
      throw new Error("Resource not found");
    }

    if (first.type !== "image" || first.resource.type !== "Image") {
      throw new Error("Resource is not an image");
    }

    const service = getImageServices(first.resource)[0];

    if (options.allowImageFallback) {
      return first.resource.id || (first.resource as any)["@id"];
    }

    if (!service) {
      throw new Error("Image service not found");
    }

    const id = service.id || (service["@id"] as string);

    if (options.skipCanonical) {
      return id;
    }

    return canonicalServiceUrl(service.id || (service["@id"] as string));
  },
  supportedTypes: ["Canvas", "CanvasRegion"],
};
