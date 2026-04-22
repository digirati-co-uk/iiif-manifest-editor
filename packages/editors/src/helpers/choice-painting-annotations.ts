import type { Vault } from "@iiif/helpers/vault";
import { addMappings, importEntities, modifyEntityField } from "@iiif/helpers/vault/actions";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import type { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { randomId } from "../helpers";

export type ChoiceBodyRef = Reference<"ContentResource">;

export type ChoiceBody = {
  id?: string;
  type: "Choice";
  label?: InternationalString;
  items?: unknown[];
};

export type ChoiceBodyInfo = {
  annotation: AnnotationNormalized | any;
  bodyIndex: number;
  choice: ChoiceBody;
  ref: ChoiceBodyRef | null;
};

export type ChoiceItemInfo = {
  index: number;
  item: any;
  resource: any;
  ref: ChoiceBodyRef | null;
};

export type PaintingChoiceCandidate = {
  annotation: AnnotationNormalized | any;
  annotationRef: Reference<"Annotation">;
  index: number;
  label: string;
  detail: string;
  body: any;
  bodyResource: any;
  bodyRef: ChoiceBodyRef | null;
  choiceItem: any;
  eligible: boolean;
  disabledReason?: string;
};

export type UnwrappedChoicePaintingAnnotation = {
  annotationRefs: Array<Reference<"Annotation">>;
  annotationPageRef: Reference<"AnnotationPage">;
  index: number;
};

export function isChoiceBody(resource: unknown): resource is ChoiceBody {
  return !!resource && typeof resource === "object" && (resource as any).type === "Choice";
}

export function getChoiceBodyInfo(annotation: AnnotationNormalized | any, vault: Vault): ChoiceBodyInfo | null {
  const bodies = toArray(annotation?.body);

  for (const [bodyIndex, body] of bodies.entries()) {
    const resource = resolveContentResource(vault, body);
    if (isChoiceBody(resource)) {
      return {
        annotation,
        bodyIndex,
        choice: resource,
        ref: getContentResourceRef(body, resource),
      };
    }
  }

  return null;
}

export function getChoiceItems(choice: ChoiceBody | null | undefined, vault: Vault): ChoiceItemInfo[] {
  return toArray(choice?.items).map((item, index) => {
    const resource = resolveContentResource(vault, item);
    return {
      index,
      item,
      resource,
      ref: getContentResourceRef(item, resource),
    };
  });
}

export function getChoiceThumbnailResource(choice: ChoiceBody | null | undefined, vault: Vault): any {
  const firstItem = getChoiceItems(choice, vault)[0];
  if (!firstItem) {
    return choice;
  }

  const resource = firstItem.resource || firstItem.ref || firstItem.item;
  if (isChoiceBody(resource)) {
    return getChoiceThumbnailResource(resource, vault);
  }

  return resource;
}

export function getAnnotationThumbnailResource(annotation: AnnotationNormalized | any, vault: Vault): any {
  const choiceInfo = getChoiceBodyInfo(annotation, vault);
  return choiceInfo ? getChoiceThumbnailResource(choiceInfo.choice, vault) : annotation;
}

export function getContentResourceThumbnailResource(resource: unknown, vault: Vault): any {
  const resolved = resolveContentResource(vault, resource);
  return isChoiceBody(resolved) ? getChoiceThumbnailResource(resolved, vault) : resolved;
}

export function updateChoiceField(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  info: ChoiceBodyInfo,
  key: string,
  value: unknown,
) {
  if (info.ref) {
    vault.modifyEntityField(info.ref, key, value);
    return;
  }

  updateEmbeddedChoice(vault, annotationRef, info, {
    ...info.choice,
    [key]: value,
  });
}

export function updateChoiceItems(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  info: ChoiceBodyInfo,
  items: unknown[],
) {
  updateChoiceField(vault, annotationRef, info, "items", items);
}

export function ensureChoiceBodyRef(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  info: ChoiceBodyInfo,
): ChoiceBodyRef {
  if (info.ref) {
    return info.ref;
  }

  const choiceId = `${annotationRef.id}/choice/${randomId()}`;
  const choiceRef: ChoiceBodyRef = { id: choiceId, type: "ContentResource" };
  const choice = {
    ...info.choice,
    id: choiceId,
  };
  const bodies = toArray(info.annotation.body);
  bodies[info.bodyIndex] = choiceRef;

  vault.batch((batchVault) => {
    batchVault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [choiceId]: choice,
          },
        },
      }),
    );
    batchVault.dispatch(
      addMappings({
        mapping: {
          [choiceId]: "ContentResource",
        },
      }),
    );
    batchVault.dispatch(
      modifyEntityField({
        id: annotationRef.id,
        type: "Annotation",
        key: "body",
        value: bodies,
      }),
    );
  });

  return choiceRef;
}

export function updateChoiceItemLabel(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  choiceInfo: ChoiceBodyInfo,
  itemInfo: ChoiceItemInfo,
  label: InternationalString,
) {
  if (itemInfo.ref) {
    vault.modifyEntityField(itemInfo.ref, "label", label);
    return;
  }

  const items = toArray(choiceInfo.choice.items);
  items[itemInfo.index] = setInlineResourceLabel(itemInfo.item, label);
  updateChoiceItems(vault, annotationRef, choiceInfo, items);
}

export function getPaintingChoiceCandidates(vault: Vault, annotationRefs: Array<Reference | any>) {
  return annotationRefs.map((ref, index) => getPaintingChoiceCandidate(vault, ref, index));
}

export function getPaintingChoiceCandidate(
  vault: Vault,
  annotationRef: Reference | any,
  index: number,
): PaintingChoiceCandidate {
  const annotation = vault.get(annotationRef as any, { skipSelfReturn: false } as any) as any;
  const resolvedAnnotationRef = getAnnotationRef(annotationRef, annotation);
  const fallbackLabel = `Media ${index + 1}`;

  if (!annotation || !resolvedAnnotationRef) {
    return {
      annotation,
      annotationRef: { id: "", type: "Annotation" },
      index,
      label: fallbackLabel,
      detail: "Annotation not found",
      body: null,
      bodyResource: null,
      bodyRef: null,
      choiceItem: null,
      eligible: false,
      disabledReason: "Annotation not found",
    };
  }

  const label = getInternationalStringText(annotation.label, fallbackLabel);
  const motivation = toArray(annotation.motivation);
  if (!motivation.includes("painting")) {
    return createDisabledCandidate(annotation, resolvedAnnotationRef, index, label, "Not a painting annotation");
  }

  if (getChoiceBodyInfo(annotation, vault)) {
    return createDisabledCandidate(annotation, resolvedAnnotationRef, index, label, "Already a Choice");
  }

  const bodies = toArray(annotation.body);
  if (bodies.length !== 1) {
    return createDisabledCandidate(annotation, resolvedAnnotationRef, index, label, "Expected one image body");
  }

  const body = bodies[0];
  const bodyResource = resolveContentResource(vault, body);
  if (!bodyResource) {
    return createDisabledCandidate(annotation, resolvedAnnotationRef, index, label, "Body not found");
  }

  const bodyType = getResourceType(bodyResource);
  if (bodyType !== "Image") {
    return createDisabledCandidate(annotation, resolvedAnnotationRef, index, label, "Only image bodies can be combined");
  }

  return {
    annotation,
    annotationRef: resolvedAnnotationRef,
    index,
    label: getInternationalStringText(bodyResource.label, label),
    detail: bodyResource.format || bodyType,
    body,
    bodyResource,
    bodyRef: getContentResourceRef(body, bodyResource),
    choiceItem: createChoiceItem(body, bodyResource),
    eligible: true,
  };
}

export function combinePaintingAnnotationsIntoChoice(
  vault: Vault,
  options: {
    annotationPageRef: Reference<"AnnotationPage">;
    selectedAnnotationIds: string[];
    defaultLanguage?: string;
    choiceLabel?: InternationalString;
  },
): Reference<"Annotation"> {
  const page = vault.get(options.annotationPageRef as any, { skipSelfReturn: false } as any) as any;
  const pageItems = toArray(page?.items);
  const selected = new Set(options.selectedAnnotationIds);
  const candidates = getPaintingChoiceCandidates(vault, pageItems)
    .filter((candidate) => selected.has(candidate.annotationRef.id))
    .sort((a, b) => a.index - b.index);

  if (candidates.length < 2) {
    throw new Error("Select at least two image annotations to combine into a Choice.");
  }

  const ineligible = candidates.find((candidate) => !candidate.eligible);
  if (ineligible) {
    throw new Error(ineligible.disabledReason || "Selected annotation cannot be combined into a Choice.");
  }

  const first = candidates[0];
  if (!first?.annotation?.target) {
    throw new Error("The first selected annotation must have a target.");
  }

  const choiceId = `${options.annotationPageRef.id}/choice/${randomId()}`;
  const annotationId = `${options.annotationPageRef.id}/annotation/${randomId()}`;
  const annotationRef: Reference<"Annotation"> = { id: annotationId, type: "Annotation" };
  const choiceRef: ChoiceBodyRef = { id: choiceId, type: "ContentResource" };
  const defaultLanguage = options.defaultLanguage || "en";
  const choiceItems = candidates.map((candidate, index) =>
    ensureChoiceItemLabel(vault, candidate, defaultLanguage, index + 1),
  );

  const choice: ChoiceBody = {
    id: choiceId,
    type: "Choice",
    ...(options.choiceLabel ? { label: options.choiceLabel } : {}),
    items: choiceItems,
  };

  const annotation = {
    id: annotationId,
    type: "Annotation",
    motivation: "painting",
    body: [choiceRef],
    target: clone(first.annotation.target),
  };

  const newPageItems = replaceSelectedPageItems(pageItems, selected, annotationRef);

  vault.batch((batchVault) => {
    batchVault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [choiceId]: choice,
          },
          Annotation: {
            [annotationId]: annotation,
          },
        },
      }),
    );
    batchVault.dispatch(
      addMappings({
        mapping: {
          [choiceId]: "ContentResource",
          [annotationId]: "Annotation",
        },
      }),
    );
    batchVault.dispatch(
      modifyEntityField({
        id: options.annotationPageRef.id,
        type: "AnnotationPage",
        key: "items",
        value: newPageItems,
      }),
    );
  });

  return annotationRef;
}

export function unwrapChoicePaintingAnnotation(
  vault: Vault,
  options: {
    annotationRef: Reference<"Annotation">;
    annotationPageRef?: Reference<"AnnotationPage">;
  },
): UnwrappedChoicePaintingAnnotation {
  const annotation = vault.get(options.annotationRef as any, { skipSelfReturn: false } as any) as any;
  const choiceInfo = annotation ? getChoiceBodyInfo(annotation, vault) : null;
  const choiceItems = choiceInfo ? getChoiceItems(choiceInfo.choice, vault) : [];

  if (!annotation || !choiceInfo) {
    throw new Error("Annotation does not contain a Choice body.");
  }

  if (choiceItems.length < 2) {
    throw new Error("Choice must contain at least two items to unwrap.");
  }

  if (!annotation.target) {
    throw new Error("Choice annotation must have a target.");
  }

  const pageMatch = options.annotationPageRef
    ? findAnnotationPageMatch(vault, options.annotationRef, options.annotationPageRef)
    : findAnnotationPageMatch(vault, options.annotationRef);

  if (!pageMatch) {
    throw new Error("Could not find parent annotation page for Choice annotation.");
  }

  const annotationEntities: Record<string, unknown> = {};
  const mappings: Record<string, string> = {};
  const annotationRefs = choiceItems.map((item, index) => {
    const annotationId = `${pageMatch.annotationPageRef.id}/annotation/${randomId()}`;
    const annotationRef: Reference<"Annotation"> = { id: annotationId, type: "Annotation" };
    annotationEntities[annotationId] = {
      id: annotationId,
      type: "Annotation",
      motivation: "painting",
      body: [clone(item.item)],
      target: clone(annotation.target),
    };
    mappings[annotationId] = "Annotation";
    return annotationRef;
  });

  const nextPageItems = pageMatch.items.flatMap((item, index) =>
    index === pageMatch.index ? annotationRefs : [item],
  );

  vault.batch((batchVault) => {
    batchVault.dispatch(
      importEntities({
        entities: {
          Annotation: annotationEntities,
        },
      }),
    );
    batchVault.dispatch(
      addMappings({
        mapping: mappings,
      }),
    );
    batchVault.dispatch(
      modifyEntityField({
        id: pageMatch.annotationPageRef.id,
        type: "AnnotationPage",
        key: "items",
        value: nextPageItems,
      }),
    );
  });

  return {
    annotationRefs,
    annotationPageRef: pageMatch.annotationPageRef,
    index: pageMatch.index,
  };
}

export function resolveContentResource(vault: Vault, input: any): any {
  if (!input) {
    return null;
  }

  if (isSpecificResource(input)) {
    return resolveContentResource(vault, input.source);
  }

  if (input.id && isContentResourceType(input.type)) {
    const resource = vault.get({ id: input.id, type: "ContentResource" } as any, { skipSelfReturn: false } as any);
    if (resource) {
      return resource;
    }
  }

  if (!input.id || input.items || input.value || input.service || input.format || input.width || input.height) {
    return input;
  }

  return vault.get(input as any, { skipSelfReturn: false } as any) || input;
}

export function getInternationalStringText(value: unknown, fallback = ""): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || fallback;
  if (typeof value === "object") {
    for (const candidate of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(candidate) && candidate.length) {
        return candidate.filter(Boolean).join(", ");
      }
      if (typeof candidate === "string" && candidate) {
        return candidate;
      }
    }
  }
  return fallback;
}

export function hasInternationalStringText(value: unknown): boolean {
  return getInternationalStringText(value, "").trim().length > 0;
}

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "undefined" || value === null) return [];
  return [value];
}

function createDisabledCandidate(
  annotation: any,
  annotationRef: Reference<"Annotation">,
  index: number,
  label: string,
  disabledReason: string,
): PaintingChoiceCandidate {
  return {
    annotation,
    annotationRef,
    index,
    label,
    detail: disabledReason,
    body: null,
    bodyResource: null,
    bodyRef: null,
    choiceItem: null,
    eligible: false,
    disabledReason,
  };
}

function getAnnotationRef(input: any, annotation: any): Reference<"Annotation"> | null {
  const id = input?.id || annotation?.id;
  return id ? { id, type: "Annotation" } : null;
}

function getContentResourceRef(input: any, resource: any): ChoiceBodyRef | null {
  const source = isSpecificResource(input) ? input.source : input;
  const id = source?.id || resource?.id;
  return id ? { id, type: "ContentResource" } : null;
}

function getResourceType(resource: any): string | undefined {
  if (Array.isArray(resource?.type)) {
    return resource.type[0];
  }
  return resource?.type;
}

function isContentResourceType(type: string | undefined) {
  return (
    type === "Image" ||
    type === "Video" ||
    type === "Sound" ||
    type === "Dataset" ||
    type === "Text" ||
    type === "TextualBody" ||
    type === "Composite" ||
    type === "List" ||
    type === "Choice" ||
    type === "Independents" ||
    type === "Audience"
  );
}

function createChoiceItem(body: any, resource: any) {
  if (isSpecificResource(body)) {
    return body;
  }

  const id = body?.id || resource?.id;
  if (id) {
    return { id, type: "ContentResource" };
  }

  return body || resource;
}

function ensureChoiceItemLabel(
  vault: Vault,
  candidate: PaintingChoiceCandidate,
  defaultLanguage: string,
  optionNumber: number,
) {
  const resource = candidate.bodyResource;
  if (hasInternationalStringText(resource?.label)) {
    return candidate.choiceItem;
  }

  const label = hasInternationalStringText(candidate.annotation?.label)
    ? candidate.annotation.label
    : ({ [defaultLanguage]: [`Option ${optionNumber}`] } as InternationalString);

  if (candidate.bodyRef) {
    vault.dispatch(
      modifyEntityField({
        id: candidate.bodyRef.id,
        type: "ContentResource",
        key: "label",
        value: label,
      }),
    );
    return candidate.choiceItem;
  }

  return setInlineResourceLabel(candidate.choiceItem, label);
}

function setInlineResourceLabel(resource: any, label: InternationalString) {
  if (isSpecificResource(resource)) {
    return {
      ...resource,
      source: {
        ...resource.source,
        label,
      },
    };
  }

  return {
    ...resource,
    label,
  };
}

function replaceSelectedPageItems(
  items: any[],
  selected: Set<string>,
  annotationRef: Reference<"Annotation">,
) {
  const nextItems = [];
  let inserted = false;

  for (const item of items) {
    const id = item?.id || item?.source?.id;
    if (id && selected.has(id)) {
      if (!inserted) {
        nextItems.push(annotationRef);
        inserted = true;
      }
      continue;
    }
    nextItems.push(item);
  }

  return nextItems;
}

function findAnnotationPageMatch(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  annotationPageRef?: Reference<"AnnotationPage">,
): { annotationPageRef: Reference<"AnnotationPage">; items: any[]; index: number } | null {
  if (annotationPageRef) {
    const page = vault.get(annotationPageRef as any, { skipSelfReturn: false } as any) as any;
    const items = toArray(page?.items);
    const index = items.findIndex((item) => item?.id === annotationRef.id);
    return index === -1 ? null : { annotationPageRef, items, index };
  }

  const pages = (vault.getState() as any).iiif.entities.AnnotationPage || {};
  for (const [id, page] of Object.entries<any>(pages)) {
    const items = toArray(page?.items);
    const index = items.findIndex((item) => item?.id === annotationRef.id);
    if (index !== -1) {
      return {
        annotationPageRef: { id, type: "AnnotationPage" },
        items,
        index,
      };
    }
  }

  return null;
}

function updateEmbeddedChoice(
  vault: Vault,
  annotationRef: Reference<"Annotation">,
  info: ChoiceBodyInfo,
  choice: ChoiceBody,
) {
  const bodies = toArray(info.annotation.body);
  bodies[info.bodyIndex] = choice;
  vault.modifyEntityField(annotationRef, "body", bodies);
}

function isSpecificResource(resource: any): resource is { type: "SpecificResource"; source: any } {
  return resource?.type === "SpecificResource" && !!resource.source;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
