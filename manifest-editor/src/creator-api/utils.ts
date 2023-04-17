import { Entities } from "@iiif/vault/actions";

export function resolveType(type: string): keyof Entities {
  switch (type) {
    case "Image":
    case "Video":
    case "Sound":
    case "Dataset":
    case "Text":
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
