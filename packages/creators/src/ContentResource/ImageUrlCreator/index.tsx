import { AddImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateImageUrlForm, createImageUrl } from "./create-image-url";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-url-creator": typeof imageUrlCreator;
    }
  }
}

export const imageUrlCreator = defineCreator({
  id: "@manifest-editor/image-url-creator",
  create: createImageUrl,
  label: "Image",
  summary: "Image from a URL",
  icon: <AddImageIcon />,
  render(ctx) {
    return <CreateImageUrlForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["format"],
  supports: {
    parentFields: ["logo", "body", "thumbnail"],
  },
  staticFields: {
    type: "Image",
  },
});
