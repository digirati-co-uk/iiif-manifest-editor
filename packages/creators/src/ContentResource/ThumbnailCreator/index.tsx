import { ScaledImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { imageServiceCreator } from "../ImageServiceCreator";
import { CreateThumbnailForm, createThumbnail } from "./create-thumbnail";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/thumbnail-image": typeof thumbnailCreator;
    }
  }
}

export const thumbnailCreator = defineCreator({
  id: "@manifest-editor/thumbnail-image",
  configKey: "iiif-image-services",
  create: createThumbnail,
  label: "IIIF thumbnail",
  summary: "Create a thumbnail from an IIIF image service.",
  icon: <ScaledImageIcon />,
  async supportsResource(value, helpers, ctx) {
    const result = await imageServiceCreator.supportsResource!(value, helpers, ctx);
    if (typeof result !== "object") return false;
    const size = result.initialData?.service?.sizes?.[0];
    return size ? { initialData: { ...result.initialData, width: size.width, height: size.height } } : false;
  },
  render(ctx) {
    return <CreateThumbnailForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "format", "width", "height", "service"],
  supports: {
    initialData: true,
    parentFields: ["thumbnail"],
  },
});
