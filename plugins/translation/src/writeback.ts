import {
  addReference,
  batchActions,
  importEntities,
} from "@iiif/helpers/vault/actions";
import type { Vault } from "@iiif/helpers/vault";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import {
  fingerprintTranslationText,
  getLanguageMapTargetText,
  getLanguageValueAt,
  normaliseTranslationText,
} from "./collection";
import { resolveSupportedLanguage } from "./options";
import type {
  LanguageMapLike,
  TranslationOccurrence,
  TranslationPath,
  TranslationTarget,
} from "./types";

type TextualBodyEntry = {
  ref: Reference<"ContentResource">;
  resource: any;
  choice?: Reference<"ContentResource">;
};

export type TranslationWriteContext = {
  vault: Vault;
};

export type WritableOccurrenceCheck = {
  writable: TranslationOccurrence[];
  existing: TranslationOccurrence[];
  stale: TranslationOccurrence[];
};

export function getWritableOccurrences(
  ctx: TranslationWriteContext,
  target: TranslationTarget,
): WritableOccurrenceCheck {
  const writable: TranslationOccurrence[] = [];
  const existing: TranslationOccurrence[] = [];
  const stale: TranslationOccurrence[] = [];

  for (const occurrence of target.occurrences) {
    const currentSource = readOccurrenceSourceText(ctx.vault, occurrence);
    if (
      fingerprintTranslationText(currentSource) !== occurrence.sourceFingerprint
    ) {
      stale.push(occurrence);
      continue;
    }

    const currentTarget = readOccurrenceExistingTargetText(
      ctx.vault,
      occurrence,
    );
    if (normaliseTranslationText(currentTarget)) {
      existing.push(occurrence);
      continue;
    }

    writable.push(occurrence);
  }

  return { writable, existing, stale };
}

export function writeTranslationForOccurrence(
  ctx: TranslationWriteContext,
  occurrence: TranslationOccurrence,
  translationText: string,
) {
  const text = translationText.trim();
  if (!text) {
    return false;
  }

  switch (occurrence.path.kind) {
    case "resource-language-map":
      writeResourceLanguageMap(
        ctx.vault,
        occurrence.path.resource,
        occurrence.path.property,
        occurrence,
        text,
      );
      return true;
    case "metadata-language-map":
      writeMetadataLanguageMap(ctx.vault, occurrence.path, occurrence, text);
      return true;
    case "required-statement-language-map":
      writeRequiredStatementLanguageMap(
        ctx.vault,
        occurrence.path,
        occurrence,
        text,
      );
      return true;
    case "textual-body":
      writeTextualBodyTranslation(ctx.vault, occurrence, text);
      return true;
  }
}

export function readOccurrenceSourceText(
  vault: Vault,
  occurrence: TranslationOccurrence,
) {
  if (occurrence.path.kind === "textual-body") {
    const body = getVaultResource(vault, occurrence.path.body);
    return typeof body?.value === "string" ? body.value : "";
  }

  return getLanguageValueAt(
    getLanguageMapForPath(vault, occurrence.path),
    occurrence.sourceMapLanguage,
    occurrence.sourceIndex,
  );
}

export function readOccurrenceTargetText(
  vault: Vault,
  occurrence: TranslationOccurrence,
) {
  if (occurrence.path.kind === "textual-body") {
    const targetBody = getTargetTextualBody(vault, occurrence);
    return typeof targetBody?.value === "string" ? targetBody.value : "";
  }

  return getLanguageValueAt(
    getLanguageMapForPath(vault, occurrence.path),
    occurrence.targetLanguage,
    occurrence.sourceIndex,
  );
}

function writeResourceLanguageMap(
  vault: Vault,
  resource: Reference,
  property: "label" | "summary",
  occurrence: TranslationOccurrence,
  translationText: string,
) {
  const currentResource = getVaultResource(vault, resource);
  const next = setLanguageMapIndexedValue(
    currentResource?.[property],
    occurrence.sourceMapLanguage,
    occurrence.sourceText,
    occurrence.targetLanguage,
    occurrence.sourceIndex,
    translationText,
  );

  vault.modifyEntityField(resource as any, property, next);
}

function writeMetadataLanguageMap(
  vault: Vault,
  path: Extract<TranslationPath, { kind: "metadata-language-map" }>,
  occurrence: TranslationOccurrence,
  translationText: string,
) {
  const resource = getVaultResource(vault, path.resource);
  const metadata = Array.isArray(resource?.metadata)
    ? [...resource.metadata]
    : [];
  const currentItem = metadata[path.metadataIndex] || { label: {}, value: {} };
  metadata[path.metadataIndex] = {
    ...currentItem,
    [path.field]: setLanguageMapIndexedValue(
      currentItem[path.field],
      occurrence.sourceMapLanguage,
      occurrence.sourceText,
      occurrence.targetLanguage,
      occurrence.sourceIndex,
      translationText,
    ),
  };

  vault.modifyEntityField(path.resource as any, "metadata", metadata);
}

function writeRequiredStatementLanguageMap(
  vault: Vault,
  path: Extract<TranslationPath, { kind: "required-statement-language-map" }>,
  occurrence: TranslationOccurrence,
  translationText: string,
) {
  const resource = getVaultResource(vault, path.resource);
  const requiredStatement = resource?.requiredStatement || {};
  const next = {
    label: { none: [""] },
    value: { none: [""] },
    ...requiredStatement,
    [path.field]: setLanguageMapIndexedValue(
      requiredStatement[path.field],
      occurrence.sourceMapLanguage,
      occurrence.sourceText,
      occurrence.targetLanguage,
      occurrence.sourceIndex,
      translationText,
    ),
  };

  vault.modifyEntityField(path.resource as any, "requiredStatement", next);
}

function writeTextualBodyTranslation(
  vault: Vault,
  occurrence: TranslationOccurrence,
  translationText: string,
) {
  if (occurrence.path.kind !== "textual-body") {
    return;
  }

  const targetBody = getTargetTextualBody(vault, occurrence);
  if (targetBody?.id) {
    vault.modifyEntityField(
      { id: targetBody.id, type: "ContentResource" } as any,
      "value",
      translationText,
    );
    vault.modifyEntityField(
      { id: targetBody.id, type: "ContentResource" } as any,
      "language",
      occurrence.targetLanguage,
    );
    return;
  }

  const sourceBody = getVaultResource(vault, occurrence.path.body);
  const bodyId = createTranslatedBodyId(occurrence);
  const bodyReference = {
    id: bodyId,
    type: "ContentResource",
  };

  if (occurrence.path.choice) {
    vault.dispatch(
      importEntities({
        entities: {
          ContentResource: {
            [bodyId]: {
              id: bodyId,
              type: "TextualBody",
              format:
                sourceBody?.format ||
                (occurrence.valueFormat === "html"
                  ? "text/html"
                  : "text/plain"),
              value: translationText,
              language: occurrence.targetLanguage,
            },
          },
        },
      }),
    );

    const choice = getVaultResource(vault, occurrence.path.choice);
    const items = Array.isArray(choice?.items) ? choice.items : [];
    vault.modifyEntityField(occurrence.path.choice as any, "items", [
      ...items,
      bodyReference,
    ]);
    return;
  }

  vault.dispatch(
    batchActions({
      actions: [
        importEntities({
          entities: {
            ContentResource: {
              [bodyId]: {
                id: bodyId,
                type: "TextualBody",
                format:
                  sourceBody?.format ||
                  (occurrence.valueFormat === "html"
                    ? "text/html"
                    : "text/plain"),
                value: translationText,
                language: occurrence.targetLanguage,
              },
            },
          },
        }),
        addReference({
          id: occurrence.path.annotation.id,
          type: "Annotation",
          key: "body",
          reference: bodyReference,
        }),
      ],
    }),
  );
}

function getLanguageMapForPath(
  vault: Vault,
  path: TranslationPath,
): LanguageMapLike {
  if (path.kind === "textual-body") {
    return null;
  }

  const resource = getVaultResource(vault, path.resource);
  if (!resource) {
    return null;
  }

  switch (path.kind) {
    case "resource-language-map":
      return resource[path.property];
    case "metadata-language-map":
      return resource.metadata?.[path.metadataIndex]?.[path.field];
    case "required-statement-language-map":
      return resource.requiredStatement?.[path.field];
  }
}

function readOccurrenceExistingTargetText(
  vault: Vault,
  occurrence: TranslationOccurrence,
) {
  if (occurrence.path.kind === "textual-body") {
    return readOccurrenceTargetText(vault, occurrence);
  }

  const languageMap = getLanguageMapForPath(vault, occurrence.path);
  return getLanguageMapTargetText(
    languageMap,
    occurrence.targetLanguage,
    occurrence.sourceIndex,
  );
}

function setLanguageMapIndexedValue(
  value: LanguageMapLike,
  sourceLanguage: string,
  sourceText: string,
  targetLanguage: string,
  sourceIndex: number,
  translationText: string,
): InternationalString {
  const next = normaliseLanguageMap(value, sourceLanguage, sourceText);
  const targetValues = [...(next[targetLanguage] || [])];
  while (targetValues.length <= sourceIndex) {
    targetValues.push("");
  }
  targetValues[sourceIndex] = translationText;
  next[targetLanguage] = targetValues;
  return next;
}

function normaliseLanguageMap(
  value: LanguageMapLike,
  sourceLanguage: string,
  sourceText: string,
): InternationalString {
  if (!value) {
    return {
      [sourceLanguage]: [sourceText],
    };
  }

  if (typeof value === "string") {
    return {
      [sourceLanguage]: [value],
    };
  }

  return Object.fromEntries(
    Object.entries(value).map(([language, values]) => [
      language,
      Array.isArray(values) ? [...values] : [],
    ]),
  ) as InternationalString;
}

function getTargetTextualBody(vault: Vault, occurrence: TranslationOccurrence) {
  if (occurrence.path.kind !== "textual-body") {
    return null;
  }

  if (occurrence.path.targetBody) {
    const body = getVaultResource(vault, occurrence.path.targetBody);
    if (body) {
      return body;
    }
  }

  const sourceBodyId = occurrence.path.body.id;
  const annotation = getVaultResource(vault, occurrence.path.annotation);
  const choiceId = occurrence.path.choice?.id || "";
  const bodies = collectTextualBodyEntries(vault, annotation).filter(
    (entry) => (entry.choice?.id || "") === choiceId,
  );

  return (
    bodies.find(({ resource: body, ref }) => {
      if (ref.id === sourceBodyId || body?.id === sourceBodyId) {
        return false;
      }

      if (body?.type !== "TextualBody" && body?.type !== "Text") {
        return false;
      }

      return languageMatches(body.language, occurrence.targetLanguage);
    })?.resource || null
  );
}

function collectTextualBodyEntries(vault: Vault, annotation: any) {
  const entries: TextualBodyEntry[] = [];
  for (const ref of toReferences(annotation?.body, "ContentResource")) {
    collectTextualBodyEntry(
      vault,
      ref as Reference<"ContentResource">,
      entries,
    );
  }
  return entries.filter(({ resource }) => isTextualBody(resource));
}

function collectTextualBodyEntry(
  vault: Vault,
  ref: Reference<"ContentResource">,
  entries: TextualBodyEntry[],
  choice?: Reference<"ContentResource">,
) {
  const resource = getVaultResource(vault, ref);
  if (!resource) {
    return;
  }

  entries.push({ ref, resource, choice });

  if (resource.type !== "Choice") {
    return;
  }

  for (const itemRef of toReferences(resource.items, "ContentResource")) {
    collectTextualBodyEntry(
      vault,
      itemRef as Reference<"ContentResource">,
      entries,
      ref,
    );
  }
}

function isTextualBody(body: any) {
  return body?.type === "TextualBody" || body?.type === "Text";
}

function toReferences(value: unknown, fallbackType?: string): Reference[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .map((item: any) => {
      if (!item?.id) {
        return null;
      }

      const type =
        fallbackType === "ContentResource" &&
        (item.type === "TextualBody" || item.type === "Text")
          ? fallbackType
          : item.type || fallbackType;

      return {
        id: item.id,
        type,
      } as Reference;
    })
    .filter((item): item is Reference => !!item?.id && !!item.type);
}

function createTranslatedBodyId(occurrence: TranslationOccurrence) {
  const annotationId =
    occurrence.path.kind === "textual-body"
      ? occurrence.path.annotation.id
      : occurrence.resource.id;
  const bodyId =
    occurrence.path.kind === "textual-body"
      ? occurrence.path.body.id
      : occurrence.id;
  return `${trimTrailingSlash(annotationId)}/translation/${encodeURIComponent(occurrence.targetLanguage)}/${hashString(bodyId)}`;
}

function languageMatches(value: unknown, language: string) {
  const matchesLanguage = (item: unknown) => {
    if (item === language) {
      return true;
    }

    return (
      typeof item === "string" &&
      resolveSupportedLanguage(item) === resolveSupportedLanguage(language)
    );
  };

  if (Array.isArray(value)) {
    return value.some(matchesLanguage);
  }

  return matchesLanguage(value);
}

function getVaultResource(vault: Vault, ref: Reference | undefined): any {
  if (!ref?.id || !ref.type) {
    return null;
  }

  const resource = vault.get(ref as any, { skipSelfReturn: false } as any);
  return resource && typeof resource === "object" ? resource : null;
}

function trimTrailingSlash(id: string) {
  return id.endsWith("/") ? id.slice(0, -1) : id;
}

function hashString(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}
