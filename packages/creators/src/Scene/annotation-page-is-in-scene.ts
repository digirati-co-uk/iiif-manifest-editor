import { HAS_PART, PART_OF } from "@iiif/parser";

export function annotationPageIsInScene(parent: any, vault: any) {
  const page = vault.get(parent.resource);
  const sceneId = page?.[HAS_PART]?.[0]?.[PART_OF];
  if (sceneId) return vault.get(sceneId, { skipSelfReturn: false })?.type === "Scene";

  // Older empty-Scene creators did not attach the parser's reverse relationship
  // to their embedded AnnotationPage. The forward relationship is authoritative
  // IIIF, so retain compatibility by finding the Scene that owns this page.
  const scenes = vault.getState?.().iiif?.entities?.Scene || {};
  return Object.values(scenes).some((scene: any) =>
    (scene?.items || []).some((item: any) => (typeof item === "string" ? item : item?.id) === parent.resource.id)
  );
}
