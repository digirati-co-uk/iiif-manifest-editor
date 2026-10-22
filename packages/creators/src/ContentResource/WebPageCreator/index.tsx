import { getContentType, isHttpUrl } from "../../resource-probes";
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
  summary: "Link to an external webpage.",
  icon: <LinkIcon />,
  async supportsResource(value, helpers) {
    if (!isHttpUrl(value)) return false;
    const contentType = await getContentType(value, helpers);
    return contentType.startsWith("text/html") || contentType.startsWith("application/xhtml+xml")
      ? { initialData: { url: value } }
      : false;
  },
  render(ctx) {
    return <CreateWebPageForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    initialData: true,
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
});
