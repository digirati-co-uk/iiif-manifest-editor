import { toRef } from "@iiif/parser/presentation-4";

export function createActionIdentity(type: string, property: string, parent: any) {
  return `create_${type}_${property}_${toRef(parent)?.type || "unknown"}`;
}
