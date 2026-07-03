import { AddImageIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { getContentType, isHttpUrl, isImageService, matchesExtension } from "../../resource-probes";
import { getCanonicalUrl } from "../ImageServiceCreator/create-image-service";
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
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const serviceUrl = getCanonicalUrl(value);
    if (serviceUrl) {
      try {
        const service = await helpers.json(serviceUrl);
        if (isImageService(service)) return false;
      } catch {
        // Not an image service; keep checking the image URL itself.
      }
    }
    const contentType = await getContentType(value, helpers);
    if (contentType.startsWith("image/") || matchesExtension(value, [".jpg", ".jpeg", ".png", ".gif", ".webp"])) {
      return { initialData: { url: value, format: contentType || undefined } };
    }
    return false;
  },
  render(ctx) {
    return <CreateImageUrlForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["format"],
  supports: {
    initialData: true,
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
