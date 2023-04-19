import { CreatorDefinition } from "@/creator-api";
import { TextFormatIcon } from "@/icons/TextFormatIcon";
import { CreateImageServerForm, createImageServer } from "./create-image-service";
import { createImageUrl } from "@/_creators/ContentResource/ImageUrlCreator/create-image-url";

export const imageServiceCreator: CreatorDefinition = {
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
  staticFields: {
    type: "Image",
  },
};
