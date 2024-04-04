import { Collection } from "@iiif/presentation-3";
import { EditorProject } from "@/shell/ProjectContext/ProjectContext.types";
import { getValue } from "@iiif/helpers";
import { v4 } from "uuid";
import slugify from "slugify";
import { CollectionStorage } from "@/shell/ProjectContext/types/Storage";

export function projectFromCollection(collection: Collection, details: Partial<EditorProject> = {}): EditorProject {
  const name = getValue(collection.label) || "Untitled collection";

  return {
    id: `manifest-editor://project/${v4()}`,
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
