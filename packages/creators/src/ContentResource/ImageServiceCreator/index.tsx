import { IIIFLogo } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateImageServerForm, createImageServer } from "./create-image-service";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-service-creator": typeof imageServiceCreator;
    }
  }
}

export const imageServiceCreator = defineCreator({
  id: "@manifest-editor/image-service-creator",
  create: createImageServer,
  label: "Image Service",
  summary: "Add an image from Image Service",
  icon: <IIIFLogo style={{ padding: 10 }} />,
  tags: ["image", "image-service"],
  render(ctx) {
    return <CreateImageServerForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "height", "width", "format", "service"],
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
});
