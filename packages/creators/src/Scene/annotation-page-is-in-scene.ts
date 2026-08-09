import { HAS_PART, PART_OF } from "@iiif/parser";

export function annotationPageIsInScene(parent: any, vault: any) {
  const page = vault.get(parent.resource);
  const sceneId = page?.[HAS_PART]?.[0]?.[PART_OF];
  return sceneId ? vault.get(sceneId, { skipSelfReturn: false })?.type === "Scene" : false;
}
