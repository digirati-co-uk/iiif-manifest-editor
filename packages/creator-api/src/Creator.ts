import { Vault } from "@iiif/helpers/vault";
import { entityActions } from "@iiif/helpers/vault/actions";
import type { Reference } from "@iiif/presentation-3";
import { CreatorRuntime } from "./CreatorRuntime";
import type { CreatableResource, CreatorDefinition, CreatorOptions } from "./types";
import { matchBasedOnResource } from "./utils";

export class Creator {
  configs: CreatorDefinition[];
  vault: Vault;
  previewVault: Vault;

  constructor(vault: Vault, configs: CreatorDefinition[], previewVault?: Vault) {
    this.configs = configs || [];
    this.vault = vault;
    this.previewVault = previewVault || new Vault();
  }

  matchBasedOnResource(resource: CreatableResource) {
    return matchBasedOnResource(resource, this.configs || [], { vault: this.vault });
  }

  async create(definition: string, payload: any, options?: Partial<CreatorOptions>): Promise<Reference | Reference[]> {
    const foundDefinition = this.configs.find((t) => t.id === definition);
    if (!foundDefinition) {
      throw new Error(`Creator config ${definition} not found`);
    }

    if (options?.parent) {
      if (foundDefinition.supports.parentTypes) {
        if (!foundDefinition.supports.parentTypes.includes(options.parent.resource.type)) {
          throw new Error(`Definition ${definition} does not support parent type ${options.parent.resource.type}`);
        }
      }
      if (foundDefinition.supports.parentFields) {
        if (!foundDefinition.supports.parentFields.includes(options.parent.property)) {
          throw new Error(`Definition ${definition} does not support parent field ${options.parent.property}`);
        }
      }

      if (foundDefinition.supports.parentFieldMap) {
        const type = foundDefinition.supports.parentFieldMap[options.parent.resource.type];
        if (!type || !type.includes(options.parent.property)) {
          throw new Error(
            `Definition ${definition} does not support parent ${options.parent.property} / ${options.parent.property}`,
          );
        }
      }
      if (foundDefinition.supports.custom) {
        const isValid = foundDefinition.supports.custom(options.parent, this.vault);
        if (!isValid) {
          throw new Error(`Definition does not support resource`);
        }
      }
    }

    const runtime = new CreatorRuntime(this.vault, foundDefinition, payload, this.configs, this.previewVault, options);

    const run = await runtime.run();
    const allResources = Array.isArray(run) ? run : [run];
    const afterActions: any[] = [];

    for (const resource of allResources) {
      if (options?.parent) {
        if (options.parent.property === "start" || options.parent.property === "target") {
          afterActions.push(
            entityActions.modifyEntityField({
              id: options.parent.resource.id,
              type: options.parent.resource.type as any,
              value: resource.ref(),
              key: options.parent.property,
            }),
          );
        } else {
          afterActions.push(
            entityActions.addReference({
              id: options.parent.resource.id,
              type: options.parent.resource.type as any,
              reference: resource.ref(),
              key: options.parent.property,
              index: options.parent.atIndex,
            }),
          );
        }
      }
    }

    const result = runtime.commit(afterActions);

    // Only run side effects if there is a parent
    if (options?.parent) {
      if (foundDefinition.sideEffects) {
        for (const sideEffect of foundDefinition.sideEffects) {
          if (sideEffect.run) {
            const allResults = Array.isArray(result) ? result : [result];
            for (const item of allResults) {
              // @todo we need more in the ctx (like parent/target where this is to be added.)
              await sideEffect.run(item, { vault: this.vault, options: options as any });
            }
          }
        }
      }
    }

    return result;
  }
}
