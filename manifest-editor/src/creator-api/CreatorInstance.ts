import { Vault } from "@iiif/helpers/vault";
import { CreatorDefinition, CreatorFunctionContext, CreatorOptions } from "./types";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { CreatorResource } from "./CreatorResource";
import { CreatorRuntime } from "./CreatorRuntime";
import { ReferencedResource } from "./ReferencedResource";
import { v4 } from "uuid";

export class CreatorInstance implements CreatorFunctionContext {
  vault: Vault;
  previewVault: Vault;
  configs: CreatorDefinition[];
  options: CreatorOptions;

  constructor(vault: Vault, options: CreatorOptions, createConfigs: CreatorDefinition[], previewVault: Vault) {
    this.vault = vault;
    this.previewVault = previewVault;
    this.options = options;
    this.configs = createConfigs;
  }

  getPreviewVault() {
    return this.previewVault;
  }

  getTarget(): SpecificResource | Reference | undefined {
    const target = this.options.target || this.options.parent?.resource;
    const position: any = this.options.initialData?.selector;
    if (target && position) {
      return {
        type: "SpecificResource",
        source: target,
        selector: {
          type: "FragmentSelector",
          value: `xywh=${[~~position.x, ~~position.y, ~~position.width, ~~position.height].join(",")}`,
        },
      };
    }

    return target;
  }

  getParent(): Reference | undefined {
    return this.options.parent?.resource;
  }
  getParentResource(): SpecificResource | undefined {
    const parent = this.getParent();
    if (parent) {
      return {
        type: "SpecificResource",
        source: parent,
      };
    }
  }

  generateId(type: string, parent?: Reference | ReferencedResource) {
    if (parent && parent instanceof ReferencedResource) {
      parent = parent.ref();
    }

    return `${(parent || this.options.parent?.resource)?.id}/${type}/${v4()}`;
  }

  ref(idOrRef: string | Reference) {
    let id = "";
    let type = "";

    if (typeof idOrRef === "string") {
      id = idOrRef;
    } else {
      id = idOrRef.id;
      type = idOrRef.type;
    }

    const state = this.vault.getState();
    const realType = state.iiif.mapping[id];

    if (!realType) {
      type = type || "unknown";
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

    const runtime = new CreatorRuntime(this.vault, foundDefinition, payload, this.configs, this.previewVault, options);

    return await runtime.run();
  }
}
