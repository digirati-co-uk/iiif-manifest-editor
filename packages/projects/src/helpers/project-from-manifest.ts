import { Manifest } from "@iiif/presentation-3";
import { getValue } from "@iiif/helpers";
import slugify from "slugify";
import { EditorProject } from "../ProjectContext.types";
import { ManifestStorage } from "../types/Storage";

function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export function projectFromManifest(manifest: Manifest, details: Partial<EditorProject> = {}): EditorProject {
  const name = getValue(manifest.label) || "Untitled manifest";

  return {
    id: `manifest-editor://project/${randomId()}`,
    filename: slugify(name, { lower: true }),
    name,
    metadata: {
      created: Date.now(),
      modified: Date.now(),
    },
    resource: {
      id: manifest.id,
      type: "Manifest",
    },
    publications: [],
    previews: [],
    settings: {},
    storage: {
      type: "manifest-storage",
      data: manifest,
    } as ManifestStorage,
    ...details,
  };
}
