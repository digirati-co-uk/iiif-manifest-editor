import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
import {
  CreateWebPageForm,
  type CreateWebpagePayload,
  createWebPage,
} from "./create-web-page";

export const webPageCreator: CreatorDefinition<CreateWebpagePayload> = {
  id: "@manifest-editor/web-page-creator",
  create: createWebPage,
  label: "Web page",
  summary: "Add link to an external web page",
  icon: <LinkIcon />,
  render(ctx) {
    return <CreateWebPageForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
};
