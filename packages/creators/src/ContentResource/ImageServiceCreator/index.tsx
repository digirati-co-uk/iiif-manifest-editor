import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { CreateImageServerForm, createImageServer } from "./create-image-service";

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

};
