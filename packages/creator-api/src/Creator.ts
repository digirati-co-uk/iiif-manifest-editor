import { Vault } from "@iiif/helpers/vault";
import { entityActions } from "@iiif/helpers/vault/actions";
import type { Reference } from "@iiif/presentation-3";
import { placeCreatedResources } from "./placeholder-position";
import {
  EditorInstance,
  beginCanvasComposition,
  getCanvasLayout,
  getEmptyCanvasPlaceholders,
  validRectangle,
} from "@manifest-editor/editor-api";
import { CreatorRuntime } from "./CreatorRuntime";
import type { CreatableResource, CreatorConfig, CreatorDefinition, CreatorOptions } from "./types";
import { matchBasedOnResource } from "./utils";

export class Creator {
  configs: CreatorDefinition[];
  vault: Vault;
  previewVault: Vault;
  creatorConfig: CreatorConfig;

  constructor(vault: Vault, configs: CreatorDefinition[], previewVault?: Vault, creatorConfig?: CreatorConfig) {
    this.configs = configs || [];
    this.vault = vault;
    this.previewVault = previewVault || new Vault();
    this.creatorConfig = creatorConfig || {};
  }

  matchBasedOnResource(resource: CreatableResource) {
    return matchBasedOnResource(resource, this.configs || [], { vault: this.vault });
  }

  withVault(vault: Vault): Creator {
    return new Creator(vault, this.configs, this.previewVault, this.creatorConfig);
  }

  async create(definition: string, payload: any, options?: Partial<CreatorOptions>): Promise<Reference | Reference[]> {
    options?.signal?.throwIfAborted();
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
            `Definition ${definition} does not support parent ${options.parent.property} / ${options.parent.property}`
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

    if (options?.placeholderPosition && !validRectangle(options.placeholderPosition.bounds)) {
      throw new Error("Invalid placeholder position");
    }
    const context = this.vault.beginInteraction({ label: `Create ${foundDefinition.resourceType}` });
    const abort = () => context.cancel();
    options?.signal?.addEventListener("abort", abort, { once: true });
    try {
      const scoped = context.vault;
      if (options?.ensurePaintingPage) {
        const { canvasId, pageId } = options.ensurePaintingPage;
        if (!scoped.get({ id: pageId, type: "AnnotationPage" })) {
          await scoped.load(pageId, { id: pageId, type: "AnnotationPage", items: [] });
          new EditorInstance({ vault: scoped, reference: { id: canvasId, type: "Canvas" } }).structural.items.add({
            id: pageId,
            type: "AnnotationPage",
          });
        }
      }
      const runtime = new CreatorRuntime(
        scoped,
        foundDefinition,
        payload,
        this.configs,
        this.previewVault,
        options,
        this.creatorConfig
      );

      const run = await runtime.run();
      options?.signal?.throwIfAborted();
      const allResources = Array.isArray(run) ? run : [run];
      const afterActions: any[] = [];

      for (const [offset, resource] of allResources.entries()) {
        if (options?.parent) {
          if (options.parent.property === "start" || options.parent.property === "target") {
            afterActions.push(
              entityActions.modifyEntityField({
                id: options.parent.resource.id,
                type: options.parent.resource.type as any,
                value: resource.ref(),
                key: options.parent.property,
              })
            );
          } else {
            afterActions.push(
              entityActions.addReference({
                id: options.parent.resource.id,
                type: options.parent.resource.type as any,
                reference: resource.ref(),
                key: options.parent.property,
                index: options.placeholderPosition?.replaceAnnotationId
                  ? scoped
                      .get<any>(options.parent.resource)
                      [options.parent.property]?.findIndex(
                        (ref: Reference) => ref.id === options.placeholderPosition!.replaceAnnotationId
                      )
                  : options.parent.atIndex === undefined
                    ? undefined
                    : options.parent.atIndex + offset,
              })
            );
          }
        }
      }

      // Validate against live occupancy before any parent references are committed.
      const placement = options?.placeholderPosition;
      if (placement) {
        if (placement.replaceAnnotationId && allResources.length !== 1)
          throw new Error("Choose one image to replace this image. Nothing has been changed.");
        const canvas = scoped.get<any>({ id: placement.canvasId, type: "Canvas" });
        const state = getCanvasLayout(scoped, canvas.id);
        if (state?.customised === false) {
          const slot = state.slots.find((slot) => slot.id === placement.placeholderId);
          const empty = getEmptyCanvasPlaceholders(scoped, canvas);
          if (
            !slot ||
            (placement.replaceAnnotationId
              ? slot.annotationIds?.length !== 1 ||
                slot.annotationIds[0] !== placement.replaceAnnotationId ||
                allResources.length !== 1
              : !empty.some((item) => item.id === slot.id) || allResources.length > empty.length)
          )
            throw new Error(
              "Not enough empty positions. Reduce the selection or choose a larger layout. Nothing has been added."
            );
        }
      }
      if (placement) beginCanvasComposition(scoped, scoped.get<any>({ id: placement.canvasId, type: "Canvas" }));
      const result = runtime.commit(afterActions);

      // Only run side effects if there is a parent
      if (options?.parent) {
        if (foundDefinition.sideEffects) {
          for (const sideEffect of foundDefinition.sideEffects) {
            if (
              sideEffect.run &&
              !(options.placeholderPosition && sideEffect.spatial && sideEffect.canvasInteraction)
            ) {
              const allResults = Array.isArray(result) ? result : [result];
              for (const item of allResults) {
                // @todo we need more in the ctx (like parent/target where this is to be added.)
                await sideEffect.run(item, { vault: scoped, options: options as any });
              }
            }
          }
        }
      }

      options?.signal?.throwIfAborted();
      if (options?.placeholderPosition) placeCreatedResources(scoped, result, runtime.options);

      return result;
    } finally {
      options?.signal?.removeEventListener("abort", abort);
      context.finish();
    }
  }
}
