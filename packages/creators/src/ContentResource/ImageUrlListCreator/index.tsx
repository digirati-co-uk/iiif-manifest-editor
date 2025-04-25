import { ImageListIcon } from "@manifest-editor/components";
import { defineCreator } from "@manifest-editor/creator-api";
import { CreateImageUrlListForm, createImageUrlList } from "./create-image-url-list";

declare module "@manifest-editor/creator-api" {
  namespace IIIFManifestEditor {
    interface CreatorDefinitions {
      "@manifest-editor/image-url-list": typeof imageUrlListCreator;
    }
  }
}

export const imageUrlListCreator = defineCreator({
  id: "@manifest-editor/image-url-list",
  label: "Image URL List",
  summary: "Image from a list of URLs",
  create: createImageUrlList,
  icon: <ImageListIcon />,
  render(ctx) {
    return <CreateImageUrlListForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["format"],
  supports: {
    parentFields: ["logo", "body", "thumbnail"],
  },
  staticFields: {
    type: "Image",
  },
});
