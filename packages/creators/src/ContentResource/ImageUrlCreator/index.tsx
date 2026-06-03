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
  tags: ["image"],
  render(ctx) {
    return <CreateImageUrlForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["format"],
  supports: {
    parentFields: ["logo", "body", "thumbnail", "items"],
    custom(parent, vault) {
      if (parent.property !== "items") {
        return true;
      }

      if (parent.resource.type === "ContentResource") {
        const resource = vault.get(parent.resource as any, { skipSelfReturn: false } as any) as any;
        return resource?.type === "Choice";
      }

      return false;
    },
  },
  staticFields: {
    type: "Image",
  },
});
