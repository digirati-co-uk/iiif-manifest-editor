import { Reference } from "@iiif/presentation-3";
import { Vault } from "@iiif/helpers/vault";
import { EditorConfig } from "./types";
import { EditorInstance } from "./EditorInstance";

export class Editor {
  vault: Vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  edit(resource: Reference, config: Partial<EditorConfig> = {}) {
    return new EditorInstance({
      reference: resource,
      vault: this.vault,
      ...config,
    });
  }
}
