import { Entities, Vault } from "@iiif/helpers/vault";
import {
  emptyAgent,
  emptyAnnotation,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
  emptyService,
  toRef,
} from "@iiif/parser";
import { CreatableResource, CreatorDefinition } from "./types";

export function resolveType(type: string): keyof Entities {
  switch (type) {
    case "Image":
    case "Video":
    case "Sound":
    case "Dataset":
    case "Text":
    case "TextualBody":
    case "Composite":
    case "List":
    case "Independents":
    case "Audience":
      return "ContentResource";
    case "ImageService1":
    case "ImageService2":
    case "ImageService3":
      return "Service";
  }

  return type as any;
}

const emptyTypes = {
  Annotation: emptyAnnotation,
  AnnotationPage: emptyAnnotationPage,
  Canvas: emptyCanvas,
  Collection: emptyCollection,
  Manifest: emptyManifest,
  Range: emptyRange,
  ResourceProvider: emptyAgent,
  Service: emptyService,
};

export function getEmptyType(type: string): any {
  const key = resolveType(type);
  return emptyTypes[key as "Manifest"] || {};
}

export function randomId() {
  return `${Math.random().toString(36).substr(2)}-${Date.now().toString(36)}`;
}

export function matchBasedOnResource(
  resource: CreatableResource,
  list: CreatorDefinition[],
  options: { vault: Vault },
): CreatorDefinition[] {
  const supported = [];
  if (list.length === 0) {
    return [];
  }
  const parent = toRef(resource.parent);
  const property = resource.property;
  const filter = resource.filter;

  for (const def of list) {
    if (filter) {
      if (!def.tags) continue;
      if (!def.tags.includes(filter)) {
        continue;
      }
    }

    if (parent && property) {
      if (def.supports.parentTypes) {
        if (!def.supports.parentTypes.includes(parent.type)) {
          continue;
        }
      }
      if (def.supports.parentFields) {
        if (!def.supports.parentFields.includes(property)) {
          continue;
        }
      }

      if (def.supports.parentFieldMap) {
        const type = def.supports.parentFieldMap[parent.type];
        if (!type || !type.includes(property)) {
          continue;
        }
      }

      if (def.supports.disallowPainting && resource.isPainting) {
        continue;
      }

      if (def.supports.custom) {
        const isValid = def.supports.custom(
          { property, resource: parent, atIndex: resource.index },
          options.vault,
        );
        if (!isValid) {
          continue;
        }
      }

      if (
        !def.supports.initialData &&
        Object.keys(resource.initialData || {}).length !== 0
      ) {
        continue;
      }

      if (def.resourceType !== resource.type) {
        if (!(def.additionalTypes || []).includes(resource.type)) {
          continue;
        }
      }
      supported.push(def);
    }
  }

  return supported;
}
