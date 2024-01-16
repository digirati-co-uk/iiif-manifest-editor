import { Entities } from "@iiif/helpers/vault/actions";
import {
  _ServiceNormalized,
  emptyAgent,
  emptyAnnotation,
  emptyAnnotationPage,
  emptyCanvas,
  emptyCollection,
  emptyManifest,
  emptyRange,
  emptyService,
} from "@iiif/parser";
import {
  AnnotationNormalized,
  AnnotationPageNormalized,
  CanvasNormalized,
  CollectionNormalized,
  ManifestNormalized,
  RangeNormalized,
  ResourceProviderNormalized,
} from "@iiif/presentation-3-normalized";

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

export function getEmptyType(type: string) {
  const key = resolveType(type);
  return emptyTypes[key as "Manifest"] || {};
}
