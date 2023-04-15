import { Vault } from "@iiif/vault";
import { CreatorDefinition } from "./types";
import { Reference } from "@iiif/presentation-3";

class Creator {
  create() {
    // ?
  }
}

export class CreatorInstance {
  vault: Vault;
  configs: CreatorDefinition[];
  resources: CreatorResource[] = [];

  constructor(vault: Vault, createConfigs: CreatorDefinition[]) {
    this.vault = vault;
    this.configs = createConfigs;
  }

  ref() {
    //
  }

  embed() {
    // Created embed resource
  }

  create() {
    // Creates a resource from the create config.
    // Creates a Creator Runtime
    // Pulls out the final CreatorResource
  }
}

class CreatorResource {
  warnings: string[] = [];
  errors: string[] = [];
  // This is what is returned from the creator instance
  get() {
    //
  }

  ref() {
    //
  }

  getAllEmbeddedResources() {
    //
  }

  getResource() {
    //
  }
}

class CreatorRuntime {
  // This will hold state for the creation process

  run(): Promise<CreatorResource> {
    // Runs the definition (with creator instance)
    throw new Error("Not implemented");
  }

  commit(): Reference {
    // this will actually save the changes to the vault.
    throw new Error("Not implemented");
  }
}

// CreatorRuntime
//  - Make a CreatorInstance
//  - calls `create()`
// CreatorInstance
//  - Creates CreatorRuntime (for nested items)
//  - Holds creator resources
//  -
