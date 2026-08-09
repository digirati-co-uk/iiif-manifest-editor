import { isSpecificResource } from "@iiif/parser";
import type { Vault4 } from "@iiif/helpers/vault-4";
import type { ModelTransform } from "./model-transforms";

export function getFirstAnnotationBody(annotation: any) {
  return Array.isArray(annotation?.body) ? annotation.body[0] : annotation?.body;
}

export function resolveFirstAnnotationBody(annotation: any, vault: any) {
  const body = getFirstAnnotationBody(annotation);
  return body ? vault.get(body, { preserveSpecificResources: true, skipSelfReturn: false }) || body : undefined;
}

export function setAnnotationBodyTransforms(
  annotationRef: { id: string; type: string },
  transforms: readonly ModelTransform[],
  vault: Vault4
) {
  const annotation = vault.get<any>(annotationRef, { skipSelfReturn: false });
  const body = resolveFirstAnnotationBody(annotation, vault);
  if (!body) return false;

  if (isSpecificResource(body) && body.id) {
    vault.modifyEntityField({ id: body.id, type: "SpecificResource" } as any, "transform", transforms);
    return true;
  }

  const wrapperId = `vault://manifest-editor/SpecificResource/${encodeURIComponent(annotationRef.id)}`;
  vault.loadSync(wrapperId, {
    id: wrapperId,
    type: "SpecificResource",
    source: isSpecificResource(body) ? body.source : body,
    transform: transforms,
  } as any);
  const reference = { id: wrapperId, type: "ContentResource" };
  const rawBody = annotation.body;
  vault.modifyEntityField(
    annotationRef as any,
    "body",
    Array.isArray(rawBody) ? [reference, ...rawBody.slice(1)] : reference
  );
  return true;
}
