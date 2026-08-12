import { Reference } from "@iiif/parser";
import type { Vault4 } from "@iiif/helpers/vault-4";
import { EditorConfig } from "./types";
import { EditorInstance } from "./EditorInstance";

export class Editor {
  vault: Vault4;

  constructor(vault: Vault4) {
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
