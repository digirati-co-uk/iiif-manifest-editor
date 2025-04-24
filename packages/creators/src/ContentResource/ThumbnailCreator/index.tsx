import { ScaledImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
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
  create: createThumbnail,
  label: "Thumbnail from service",
  summary: "Add thumbnail from an image service",
  icon: <ScaledImageIcon />,
  render(ctx) {
    return <CreateThumbnailForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "format"],
  supports: {
    parentFields: ["thumbnail"],
  },
});
