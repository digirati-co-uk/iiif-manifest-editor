import { Manifest } from "@iiif/presentation-3";
import { getValue } from "@iiif/vault-helpers";
import slugify from "slugify";
import { v4 } from "uuid";
import { EditorProject } from "../ProjectContext.types";
import { ManifestStorage } from "../types/Storage";

export function projectFromManifest(manifest: Manifest, details: Partial<EditorProject> = {}): EditorProject {
  const name = getValue(manifest.label) || "Untitled manifest";
  return {
    id: `manifest-editor://project/${v4()}`,
    filename: slugify(name, { lower: true }),
    name,
    metadata: {
      created: Date.now(),
      modified: Date.now(),
    },
    publications: [],
    previews: [],
    settings: {},
    storage: {
      type: "manifest-storage",
      data: manifest,
    } as ManifestStorage,
    source: {
      id: manifest.id,
      type: "Manifest",
    },
    ...details,
  };
}
