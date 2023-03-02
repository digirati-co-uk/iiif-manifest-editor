import { ExplorerFormat } from "../IIIFExplorer.types";
import { ContentState, serialiseContentState } from "@iiif/vault-helpers";

export const contentStateFormat: ExplorerFormat<"content-state"> = {
  label: "Content state",
  supportedTypes: ["Collection", "Manifest", "Canvas", "CanvasRegion"],
  format: async (resource, options, parent) => {
    const base = {
      "@context": "http://iiif.io/api/presentation/3/context.json" as any,
      id: "",
      type: "Annotation",
      motivation: ["contentState"],
      target: {},
    };

    if (resource.type === "Collection") {
      base.target = {
        id: resource.id,
        type: "Collection",
      };
    }

    if (resource.type === "Manifest") {
      // just manifest
      base.target = {
        id: resource.id,
        type: "Manifest",
      };
    }

    if (resource.type === "Canvas" || resource.type === "CanvasRegion") {
      // which manifest is it in?
      if (parent && parent.type === "Manifest") {
        base.target = {
          id: resource.id,
          type: "Canvas",
          partOf: [
            {
              id: parent.id,
              type: "Manifest",
            },
          ],
        };
      } else {
        base.target = {
          id: resource.id,
          type: "Canvas",
        };
      }
    }

    return options.encoded ? serialiseContentState(base as ContentState) : JSON.stringify(base);
  },
};
