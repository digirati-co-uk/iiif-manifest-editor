import type { Vault } from "@iiif/helpers/vault";
import { HAS_PART, PART_OF } from "@iiif/parser";
import type { SpecificResource } from "@iiif/presentation-3";
import { references } from "@manifest-editor/editor-api";
import { ReferencedResource } from "./ReferencedResource";
import { getEmptyType, resolveType } from "./utils";

export class CreatorResource {
  resource: any;
  warnings: string[] = [];
  errors: string[] = [];
  partOf: any;
  references: ReferencedResource[] = [];
  embedded: CreatorResource[] = [];
  vault: Vault;
  specificResource?: SpecificResource;

  constructor(inputData: any, vault: Vault) {
    this.vault = vault;
    let data = { ...inputData };

    if (data.type === "SpecificResource") {
      const source = data.source;
      this.specificResource = { ...data, source: { id: source.id, type: resolveType(source.type) } };
      data = source;
    }

    const properties = Object.keys(data);
    const defaultType = getEmptyType(data.type);

    for (const key of properties) {
      // These properties are NOT references and can be just included normally.
      if (references.inlineProperties.includes(key as any) || !references.all.includes(key as any)) {
        continue;
      }

      if (data.type === "Range" && key === "items") {
        const newRange: any = [];
        for (const range of data[key]) {
          if (range instanceof ReferencedResource) {
            this.references.push(range);
            newRange.push(range);
            continue;
          }

          const rangeRef = new ReferencedResource(range, vault);
          newRange.push(rangeRef);
          data[key] = rangeRef;
        }
        data[key] = newRange;
        continue;
      }

      if (data.type === "Manifest" && key === "start") {
        const start = data[key];

        if (start instanceof ReferencedResource) {
          this.references.push(start);
          continue;
        }

        const startRef = new ReferencedResource(start, vault);
        data[key] = startRef;
        continue;
      }

      if (data.type === "Annotation" && key === "target") {
        let target = data[key];

        if (target instanceof ReferencedResource) {
          this.references.push(target);
          continue;
        }

        if (typeof target === "string") {
          target = { id: target, type: "Canvas" };
        }

        const targetRef = new ReferencedResource(target, vault);
        data[key] = targetRef;
        continue;
      }

      // @todo Handle single item cases. (not caught by the above 2 cases)
      if (references.single.includes(key as any)) {
        continue;
      }

      // This property SHOULD already be in the Vault OR an instance of creator resource.
      if (references.externalProperties.includes(key as any) || references.internalProperties.includes(key as any)) {
        const _items = (data[key] || []) as any[];
        const items = Array.isArray(_items) ? _items : [_items];
        const newItems: any[] = [];
        for (const item of items) {
          if (item instanceof ReferencedResource) {
            this.references.push(item);
            newItems.push(item);
            continue;
          }
          if (item instanceof CreatorResource) {
            this.embedded.push(item);
            newItems.push(item);
            continue;
          }

          const exists = this.vault.get(item, { skipSelfReturn: true });
          if (exists) {
            const type = resolveType(item.type);
            const newItem = new ReferencedResource({ id: item.id, type }, vault);
            this.references.push(newItem);
            newItems.push(newItem);
          } else {
            const newItem = new CreatorResource(item, vault);
            this.embedded.push(newItem);
            newItems.push(newItem);
          }
        }
        data[key] = newItems;
      }
    }
    this.resource = { ...defaultType, ...data };
  }

  // This is what is returned from the creator instance
  get() {
    return this.resource;
  }

  ref() {
    if (this.specificResource) {
      return this.specificResource;
    }

    return { id: this.resource.id, type: resolveType(this.resource.type as string) as any };
  }

  getAllReferencedResources() {
    return this.references;
  }

  getAllEmbeddedResources(): CreatorResource[] {
    const allEmbedded = [];
    for (const resource of this.embedded) {
      allEmbedded.push(...resource.getAllEmbeddedResources());
    }
    allEmbedded.push(...this.embedded);
    return allEmbedded;
  }

  getVaultResource() {
    const resource = this.resource;
    const properties = Object.keys(resource);
    const newResource: any = {};

    for (const key of properties) {
      // Skip these, they are just normal inline values.
      if (references.inlineProperties.includes(key as any) || !references.all.includes(key as any)) {
        newResource[key] = resource[key];
        continue;
      }

      if (references.single.includes(key as any)) {
        const ref = resource[key];
        if (ref instanceof ReferencedResource) {
          // These MUST be specific resources.
          if (
            (resource.type === "Manifest" && key === "start") ||
            (resource.type === "Annotation" && key === "target")
          ) {
            newResource[key] = ref.specificResource();
          } else {
            newResource[key] = ref.optionalSpecificResource();
          }
        } else {
          newResource[key] = resource[key];
        }
        continue;
      }

      if (resource[key]) {
        newResource[key] = [];
        for (const item of resource[key] || []) {
          if (item instanceof ReferencedResource) {
            newResource[key].push(item.optionalSpecificResource());
          }
          if (item instanceof CreatorResource) {
            newResource[key].push(item.ref());
          }
        }
      }
    }

    if (this.partOf) {
      newResource[HAS_PART] = newResource[HAS_PART] || [];
      newResource[HAS_PART].push(this.partOf);
    }

    return newResource;
  }

  setPartOf(id: string) {
    const ref = this.ref();
    this.partOf = {
      id: ref.id,
      type: resolveType(ref.type),
      [PART_OF]: id,
    };
  }
}
