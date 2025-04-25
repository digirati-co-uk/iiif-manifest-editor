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
  render(ctx) {
    return <CreateImageServerForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "height", "width", "format", "service"],
  supports: {
    parentFields: ["logo", "body", "thumbnail"],
  },
});
