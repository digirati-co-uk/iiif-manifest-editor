import { Entities } from "@iiif/helpers/vault";
import {
  emptyAgent,
  emptyAnnotation,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
  emptyService,
} from "@iiif/parser";

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
