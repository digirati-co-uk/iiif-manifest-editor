import { defineCreator } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
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
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreateImageServerForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "type", "height", "width", "format", "service"],
  supports: {
    parentFields: ["logo", "body", "thumbnail"],
  },
});
