import { AddImageIcon } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import {
  CreateImageUrlForm,
  type CreateImageUrlPayload,
  createImageUrl,
} from "./create-image-url";

export const imageUrlCreator: CreatorDefinition<CreateImageUrlPayload> = {
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
};
