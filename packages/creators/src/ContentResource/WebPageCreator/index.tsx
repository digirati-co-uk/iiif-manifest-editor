import { defineCreator } from "@manifest-editor/creator-api";
import { LinkIcon } from "@manifest-editor/ui/icons/LinkIcon";
import { CreateWebPageForm, createWebPage } from "./create-web-page";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/web-page-creator": typeof webPageCreator;
    }
  }
}

export const webPageCreator = defineCreator({
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
});
