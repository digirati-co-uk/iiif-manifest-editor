import { Collection } from "@iiif/presentation-3";
import { EditorProject } from "../ProjectContext.types";
import { getValue } from "@iiif/helpers";
import slugify from "slugify";
import { CollectionStorage } from "../types/Storage";
import { randomId } from "./random-id";

export function projectFromCollection(collection: Collection, details: Partial<EditorProject> = {}): EditorProject {
  const name = getValue(collection.label) || "Untitled collection";

  return {
    id: `manifest-editor://project/${randomId()}`,
    filename: slugify(name, { lower: true }),
    name,
    metadata: {
      created: Date.now(),
      modified: Date.now(),
    },
    resource: {
      id: collection.id,
      type: "Collection",
    },
    publications: [],
    previews: [],
    settings: {},
    storage: {
      type: "collection-storage",
      data: collection,
    } as CollectionStorage,
    ...details,
  };
}
