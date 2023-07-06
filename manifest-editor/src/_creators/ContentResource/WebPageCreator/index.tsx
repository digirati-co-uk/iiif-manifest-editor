import { CreatorDefinition } from "@/creator-api";
import { CreateWebPageForm, createWebPage } from "./create-web-page";
import linkIcon from "../../../icons/LinkIcon.svg";

export const webPageCreator: CreatorDefinition = {
  id: "@manifest-editor/web-page-creator",
  create: createWebPage,
  label: "Web page",
  summary: "Add link to an external web page",
  icon: <img src={linkIcon} />,
  render(ctx) {
    return <CreateWebPageForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
};
