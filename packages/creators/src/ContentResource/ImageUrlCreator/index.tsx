import { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import { createImageUrl, CreateImageUrlForm } from "./create-image-url";

export const imageUrlCreator: CreatorDefinition = {
  id: "@manifest-editor/image-url-creator",
  create: createImageUrl,
  label: "Image URL",
  summary: "Add an image from a URL",
  icon: <TextFormatIcon />,
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
};
