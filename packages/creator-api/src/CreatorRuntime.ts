import type { Vault } from "@iiif/helpers/vault";
import { addMappings, batchActions, importEntities } from "@iiif/helpers/vault/actions";
import type { Reference } from "@iiif/presentation-3";
import { CreatorInstance } from "./CreatorInstance";
import { CreatorResource } from "./CreatorResource";
import type { CreatorDefinition, CreatorOptions } from "./types";
import { resolveType } from "./utils";

export class CreatorRuntime {
  // This will hold state for the creation process
  resource: CreatorResource | null = null;
  payload: any;
  vault: Vault;
  previewVault: Vault;
  definition: CreatorDefinition;
  options: CreatorOptions;
  configs: CreatorDefinition[];

  constructor(
    vault: Vault,
    definition: CreatorDefinition,
    payload: any,
    createConfigs: CreatorDefinition[],
    previewVault: Vault,
    options?: Partial<CreatorOptions>,
  ) {
    this.vault = vault;
    this.previewVault = previewVault;
    this.definition = definition;
    this.payload = payload;
    this.configs = createConfigs;
    this.options = {
      targetType: options?.targetType || definition.resourceType,
      ...(options || {}),
    };
  }

  async run(): Promise<CreatorResource> {
    const instance = new CreatorInstance(this.vault, this.options, this.configs, this.previewVault);
    const result = await this.definition.create(this.payload, instance);

    if (result instanceof CreatorResource) {
      this.resource = result;
    } else {
      this.resource = new CreatorResource(result, this.vault);
    }

    return this.resource;
  }

  getActions() {
    if (!this.resource) {
      return [];
    }

    const actions = [];

    const resources: any = {};
    const mapping: any = {};

    if (this.options.parent) {
      this.resource.setPartOf(this.options.parent.resource.id);
    }

    const embedded = this.resource.getAllEmbeddedResources();

    const allItems = [...embedded, this.resource];

    for (const item of allItems) {
      const resource = item.getVaultResource();
      if (!resource.type || !resource.id) {
        continue;
      }
      const type = resolveType(resource.type);
      resources[type] = resources[type] ? resources[type] : {};
      resources[type][resource.id] = resource;
      mapping[resource.id] = type;
    }

    actions.push(importEntities({ entities: resources }));
    actions.push(addMappings({ mapping }));

    return actions as any[];
  }

  commit(afterActions: any[] = []): Reference {
    if (!this.resource) {
      throw new Error("Creator has not been run");
    }

    const actions = this.getActions();
    this.vault.dispatch(batchActions({ actions: [...actions, ...afterActions] }));

    return this.resource.ref() as Reference;
  }
}
