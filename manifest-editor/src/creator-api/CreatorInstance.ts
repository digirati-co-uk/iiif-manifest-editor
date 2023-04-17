import { Vault } from "@iiif/vault";
import { CreatorDefinition, CreatorOptions } from "./types";
import { Reference } from "@iiif/presentation-3";
import { CreatorResource } from "./CreatorResource";
import { CreatorRuntime } from "./CreatorRuntime";
import { ReferencedResource } from "./ReferencedResource";

export class CreatorInstance {
  vault: Vault;
  configs: CreatorDefinition[];
  options: CreatorOptions;

  constructor(vault: Vault, options: CreatorOptions, createConfigs: CreatorDefinition[]) {
    this.vault = vault;
    this.options = options;
    this.configs = createConfigs;
  }

  ref(idOrRef: string | Reference) {
    let id = "";
    let type = "";

    if (typeof idOrRef === "string") {
      id = idOrRef;
    } else {
      id = idOrRef.id;
    }

    const state = this.vault.getState();
    const realType = state.iiif.mapping[id];

    if (!realType) {
      type = "unknown";
    } else {
      type = realType;
    }

    return new ReferencedResource({ id, type }, this.vault);
  }

  embed(data: any) {
    return new CreatorResource(data, this.vault);
  }

  async create(definition: string, payload: any, options?: Partial<CreatorOptions>): Promise<CreatorResource> {
    const foundDefinition = this.configs.find((t) => t.id === definition);
    if (!foundDefinition) {
      throw new Error(`Creator config ${definition} not found`);
    }

    const runtime = new CreatorRuntime(this.vault, foundDefinition, payload, this.configs, options);

    return await runtime.run();
  }
}
