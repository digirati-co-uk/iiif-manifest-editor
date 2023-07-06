import { IS_EXTERNAL } from "@iiif/parser";

export function isExternal(resource: any) {
  return !!(resource && resource[IS_EXTERNAL]);
}
