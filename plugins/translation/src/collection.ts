import { getAvailableLanguagesFromResource } from "@iiif/helpers/i18n";
import type { Vault } from "@iiif/helpers/vault";
import type { InternationalString, Reference } from "@iiif/presentation-3";
import type {
  LanguageMapLike,
  TranslationOccurrence,
  TranslationPath,
  TranslationResourceRef,
  TranslationRunOptions,
  TranslationStatus,
  TranslationTarget,
  TranslationValueFormat,
} from "./types";
import { normaliseLanguageCode, resolveSourceLanguage, resolveSupportedLanguage } from "./options";

type CollectContext = {
  vault: Vault;
  options: TranslationRunOptions;
  occurrences: TranslationOccurrence[];
  visited: Set<string>;
};

type SourceEntry = {
  sourceMapLanguage: string;
  sourceIndex: number;
  sourceText: string;
};

type AnnotationBodyResourceEntry = {
  ref: Reference<"ContentResource">;
  resource: any;
  choice?: Reference<"ContentResource">;
};

export type DetectedManifestLanguage = {
  language: string;
  count: number;
  iiifLanguages: string[];
};

export type TranslationLanguageProgress = {
  language: string;
  total: number;
  missing: number;
  existing: number;
  suggested: number;
  skipped: number;
  stale: number;
};

type LanguageDetectionContext = {
  vault: Vault;
  languages: Map<string, DetectedManifestLanguage>;
  visited: Set<string>;
};

export function collectTranslationTargets(
  vault: Vault,
  root: Reference,
  options: TranslationRunOptions,
): TranslationTarget[] {
  const ctx: CollectContext = {
    vault,
    options,
    occurrences: [],
    visited: new Set(),
  };

  walkResource(ctx, root);

  const byKey = new Map<string, TranslationTarget>();
  for (const occurrence of ctx.occurrences) {
    const normalisedSourceText = normaliseTranslationText(
      occurrence.sourceText,
    );
    if (!normalisedSourceText) {
      continue;
    }

    const key = createTranslationTargetKey(
      normalisedSourceText,
      occurrence.sourceLanguage,
      occurrence.targetLanguage,
      occurrence.valueFormat,
    );
    const existing = byKey.get(key);

    if (existing) {
      existing.occurrences.push(occurrence);
      existing.status = mergeStatus(existing.status, occurrence.status);
      continue;
    }

    byKey.set(key, {
      key,
      sourceLanguage: occurrence.sourceLanguage,
      targetLanguage: occurrence.targetLanguage,
      sourceText: occurrence.sourceText,
      normalisedSourceText,
      valueFormat: occurrence.valueFormat,
      occurrences: [occurrence],
      status: occurrence.status,
    });
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const status = statusOrder(a.status) - statusOrder(b.status);
    if (status !== 0) return status;
    return a.sourceText.localeCompare(b.sourceText);
  });
}

export function collectDetectedManifestLanguages(
  vault: Vault,
  root: Reference,
): DetectedManifestLanguage[] {
  const ctx: LanguageDetectionContext = {
    vault,
    languages: new Map(),
    visited: new Set(),
  };

  walkDetectedLanguageResource(ctx, root);

  return Array.from(ctx.languages.values()).sort((a, b) =>
    getLanguageSortLabel(a).localeCompare(getLanguageSortLabel(b)),
  );
}

export function collectTranslationLanguageProgress(
  vault: Vault,
  root: Reference,
  options: TranslationRunOptions,
  languages = collectDetectedManifestLanguages(vault, root).map(
    (item) => item.language,
  ),
): TranslationLanguageProgress[] {
  return languages.filter((language) => !!resolveSupportedLanguage(language)).map((language) => {
    const progress: TranslationLanguageProgress = {
      language,
      total: 0,
      missing: 0,
      existing: 0,
      suggested: 0,
      skipped: 0,
      stale: 0,
    };

    for (const target of collectTranslationTargets(vault, root, {
      ...options,
      targetLanguage: language,
    })) {
      progress.total += 1;
      progress[target.status] += 1;
    }

    return progress;
  });
}

export function normaliseTranslationText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function fingerprintTranslationText(value: string) {
  return normaliseTranslationText(value);
}

export function createTranslationTargetKey(
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string,
  valueFormat: TranslationValueFormat,
) {
  return `${sourceLanguage}:${targetLanguage}:${valueFormat}:${sourceText.toLowerCase()}`;
}

export function getLanguageMapSourceEntries(
  value: LanguageMapLike,
  sourceLanguage: string,
): SourceEntry[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return value.trim()
      ? [
          {
            sourceMapLanguage: sourceLanguage,
            sourceIndex: 0,
            sourceText: value,
          },
        ]
      : [];
  }

  const directValues = getLanguageValues(value, sourceLanguage);
  if (directValues.length) {
    return directValues
      .map((sourceText, sourceIndex) => ({
        sourceMapLanguage: sourceLanguage,
        sourceIndex,
        sourceText,
      }))
      .filter((entry) => normaliseTranslationText(entry.sourceText));
  }

  const resolvedSourceLanguage = resolveSupportedLanguage(sourceLanguage);
  if (resolvedSourceLanguage) {
    const matchedLanguage = Object.keys(value).find(
      (language) =>
        language !== sourceLanguage &&
        resolveSupportedLanguage(language) === resolvedSourceLanguage,
    );

    if (matchedLanguage) {
      return getLanguageValues(value, matchedLanguage)
        .map((sourceText, sourceIndex) => ({
          sourceMapLanguage: matchedLanguage,
          sourceIndex,
          sourceText,
        }))
        .filter((entry) => normaliseTranslationText(entry.sourceText));
    }
  }

  const noLanguageValues = getLanguageValues(value, "none");
  return noLanguageValues
    .map((sourceText, sourceIndex) => ({
      sourceMapLanguage: "none",
      sourceIndex,
      sourceText,
    }))
    .filter((entry) => normaliseTranslationText(entry.sourceText));
}

export function getLanguageValueAt(
  value: LanguageMapLike,
  language: string,
  index: number,
) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return language === "none" || index === 0 ? value : "";
  }

  return getLanguageValues(value, language)[index] || "";
}

export function getLanguageValues(
  value: InternationalString,
  language: string,
) {
  const values = value[language];
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((item): item is string => typeof item === "string");
}

export function getLanguageMapTargetText(
  value: LanguageMapLike,
  targetLanguage: string,
  sourceIndex: number,
) {
  const exactValue = getLanguageValueAt(value, targetLanguage, sourceIndex);
  if (normaliseTranslationText(exactValue)) {
    return exactValue;
  }

  if (!value || typeof value === "string") {
    return "";
  }

  const resolvedTargetLanguage = resolveSupportedLanguage(targetLanguage);
  if (resolvedTargetLanguage) {
    for (const language of Object.keys(value)) {
      if (
        language === targetLanguage ||
        resolveSupportedLanguage(language) !== resolvedTargetLanguage
      ) {
        continue;
      }

      const valueAtIndex = getLanguageValueAt(value, language, sourceIndex);
      if (normaliseTranslationText(valueAtIndex)) {
        return valueAtIndex;
      }
    }
  }

  return (
    getLanguageValues(value, targetLanguage).find((item) =>
      normaliseTranslationText(item),
    ) || ""
  );
}

export function isHtmlTranslationValue(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function walkResource(ctx: CollectContext, ref: Reference | null | undefined) {
  if (!ref?.id || !ref.type) {
    return;
  }

  const key = `${ref.type}:${ref.id}`;
  if (ctx.visited.has(key)) {
    return;
  }
  ctx.visited.add(key);

  const resource = getVaultResource(ctx.vault, ref);
  if (!resource) {
    return;
  }

  collectResourceLanguageMaps(ctx, resource);
  collectMetadata(ctx, resource);
  collectRequiredStatement(ctx, resource);

  for (const provider of toReferences(resource.provider, "Agent")) {
    walkResource(ctx, provider);
  }

  switch (resource.type) {
    case "Manifest":
      for (const item of toReferences(resource.items, "Canvas")) {
        walkResource(ctx, item);
      }
      for (const item of toReferences(resource.structures, "Range")) {
        walkResource(ctx, item);
      }
      break;
    case "Canvas":
      for (const page of [
        ...toReferences(resource.items, "AnnotationPage"),
        ...toReferences(resource.annotations, "AnnotationPage"),
      ]) {
        walkResource(ctx, page);
      }
      break;
    case "Range":
      for (const item of toReferences(resource.items)) {
        walkResource(ctx, item);
      }
      break;
    case "AnnotationPage":
      for (const item of toReferences(resource.items, "Annotation")) {
        walkResource(ctx, item);
      }
      break;
    case "Annotation":
      collectAnnotationBodies(ctx, resource);
      break;
  }
}

function walkDetectedLanguageResource(
  ctx: LanguageDetectionContext,
  ref: Reference | null | undefined,
) {
  if (!ref?.id || !ref.type) {
    return;
  }

  const key = `${ref.type}:${ref.id}`;
  if (ctx.visited.has(key)) {
    return;
  }
  ctx.visited.add(key);

  const resource = getVaultResource(ctx.vault, ref);
  if (!resource) {
    return;
  }

  collectDetectedResourceLanguages(ctx, resource);

  for (const provider of toReferences(resource.provider, "Agent")) {
    walkDetectedLanguageResource(ctx, provider);
  }

  switch (resource.type) {
    case "Manifest":
      for (const item of toReferences(resource.items, "Canvas")) {
        walkDetectedLanguageResource(ctx, item);
      }
      for (const item of toReferences(resource.structures, "Range")) {
        walkDetectedLanguageResource(ctx, item);
      }
      break;
    case "Canvas":
      for (const page of [
        ...toReferences(resource.items, "AnnotationPage"),
        ...toReferences(resource.annotations, "AnnotationPage"),
      ]) {
        walkDetectedLanguageResource(ctx, page);
      }
      break;
    case "Range":
      for (const item of toReferences(resource.items)) {
        walkDetectedLanguageResource(ctx, item);
      }
      break;
    case "AnnotationPage":
      for (const item of toReferences(resource.items, "Annotation")) {
        walkDetectedLanguageResource(ctx, item);
      }
      break;
    case "Annotation":
      for (const body of toReferences(resource.body, "ContentResource")) {
        walkDetectedLanguageResource(ctx, body);
      }
      break;
    case "Choice":
      for (const item of toReferences(resource.items, "ContentResource")) {
        walkDetectedLanguageResource(ctx, item);
      }
      break;
  }
}

function collectDetectedResourceLanguages(ctx: LanguageDetectionContext, resource: any) {
  for (const language of getAvailableLanguagesFromResourceSafe(resource)) {
    if (typeof language === "string") {
      addDetectedLanguage(ctx, language, 1);
    }
  }
}

function getAvailableLanguagesFromResourceSafe(resource: any): unknown[] {
  const languages = new Set<string>();

  try {
    for (const language of getAvailableLanguagesFromResource(resource)) {
      if (typeof language === "string") {
        languages.add(language);
      }
    }
  } catch {
    // The local fallback below covers resource shapes that the helper cannot inspect.
  }

  for (const language of getFallbackAvailableLanguages(resource)) {
    languages.add(language);
  }

  return Array.from(languages);
}

function getFallbackAvailableLanguages(resource: any): string[] {
  const languages = new Set<string>();

  addLanguageMapLanguages(languages, resource?.label);
  addLanguageMapLanguages(languages, resource?.summary);

  if (typeof resource?.language === "string") {
    languages.add(resource.language);
  } else if (Array.isArray(resource?.language)) {
    for (const language of resource.language) {
      if (typeof language === "string") {
        languages.add(language);
      }
    }
  }

  const requiredStatement = resource?.requiredStatement;
  if (requiredStatement && !Array.isArray(requiredStatement)) {
    addLanguageMapLanguages(languages, requiredStatement.label);
    addLanguageMapLanguages(languages, requiredStatement.value);
  }

  if (Array.isArray(resource?.metadata)) {
    for (const item of resource.metadata) {
      addLanguageMapLanguages(languages, item?.label);
      addLanguageMapLanguages(languages, item?.value);
    }
  }

  return Array.from(languages);
}

function addLanguageMapLanguages(languages: Set<string>, value: LanguageMapLike) {
  if (!value || typeof value === "string") {
    return;
  }

  for (const [language, values] of Object.entries(value)) {
    if (Array.isArray(values) && values.some((item) => typeof item === "string" && normaliseTranslationText(item))) {
      languages.add(language);
    }
  }
}

function addDetectedLanguage(
  ctx: LanguageDetectionContext,
  rawLanguage: string,
  count: number,
) {
  const language = resolveSourceLanguage(rawLanguage);
  if (!language) {
    return;
  }

  const normalisedRawLanguage = normaliseLanguageCode(rawLanguage);
  const existing = ctx.languages.get(language);
  if (existing) {
    existing.count += count;
    if (!existing.iiifLanguages.includes(normalisedRawLanguage)) {
      existing.iiifLanguages.push(normalisedRawLanguage);
    }
    return;
  }

  ctx.languages.set(language, {
    language,
    count,
    iiifLanguages: [normalisedRawLanguage],
  });
}

function collectResourceLanguageMaps(
  ctx: CollectContext,
  resource: any,
  refOverride?: TranslationResourceRef,
) {
  const ref = refOverride || toResourceRef(resource);
  addLanguageMapOccurrences(ctx, {
    path: { kind: "resource-language-map", resource: ref, property: "label" },
    resource: ref,
    propertyLabel: "Label",
    value: resource.label,
  });
  addLanguageMapOccurrences(ctx, {
    path: { kind: "resource-language-map", resource: ref, property: "summary" },
    resource: ref,
    propertyLabel: "Summary",
    value: resource.summary,
  });
}

function collectMetadata(
  ctx: CollectContext,
  resource: any,
  refOverride?: TranslationResourceRef,
) {
  const metadata = Array.isArray(resource.metadata) ? resource.metadata : [];
  const ref = refOverride || toResourceRef(resource);

  metadata.forEach((item: any, metadataIndex: number) => {
    addLanguageMapOccurrences(ctx, {
      path: {
        kind: "metadata-language-map",
        resource: ref,
        metadataIndex,
        field: "label",
      },
      resource: ref,
      propertyLabel: `Metadata ${metadataIndex + 1} label`,
      value: item?.label,
    });
    addLanguageMapOccurrences(ctx, {
      path: {
        kind: "metadata-language-map",
        resource: ref,
        metadataIndex,
        field: "value",
      },
      resource: ref,
      propertyLabel: `Metadata ${metadataIndex + 1} value`,
      value: item?.value,
    });
  });
}

function collectRequiredStatement(
  ctx: CollectContext,
  resource: any,
  refOverride?: TranslationResourceRef,
) {
  const requiredStatement = resource.requiredStatement;
  if (!requiredStatement) {
    return;
  }

  const ref = refOverride || toResourceRef(resource);
  addLanguageMapOccurrences(ctx, {
    path: {
      kind: "required-statement-language-map",
      resource: ref,
      field: "label",
    },
    resource: ref,
    propertyLabel: "Required statement label",
    value: requiredStatement.label,
  });
  addLanguageMapOccurrences(ctx, {
    path: {
      kind: "required-statement-language-map",
      resource: ref,
      field: "value",
    },
    resource: ref,
    propertyLabel: "Required statement value",
    value: requiredStatement.value,
  });
}

function collectAnnotationBodies(ctx: CollectContext, annotation: any) {
  const annotationRef = {
    id: annotation.id,
    type: "Annotation",
  } as Reference<"Annotation">;
  const bodies = collectAnnotationBodyResources(ctx.vault, annotation);

  for (const { ref, resource } of bodies) {
    const resourceRef = {
      ...ref,
      label: getResourceDisplayLabel(resource, resource.id || ref.id),
    };
    collectResourceLanguageMaps(ctx, resource, resourceRef);
    collectMetadata(ctx, resource, resourceRef);
    collectRequiredStatement(ctx, resource, resourceRef);
  }

  if (ctx.options.contentFilters?.annotationBodies === false) {
    return;
  }

  const textualBodies = bodies.filter((entry) => isTextualBody(entry.resource));

  for (const { ref: bodyRef, resource: body, choice } of textualBodies) {
    if (!isSourceTextualBody(body, ctx.options.sourceLanguage)) {
      continue;
    }

    const sourceText = typeof body.value === "string" ? body.value : "";
    if (!normaliseTranslationText(sourceText)) {
      continue;
    }

    const targetBody = findTextualBodyEntryForLanguage(
      textualBodies.filter((entry) =>
        isSameTextualBodyContainer(choice, entry),
      ),
      ctx.options.targetLanguage,
    );
    const targetText =
      typeof targetBody?.resource.value === "string"
        ? targetBody.resource.value
        : "";
    ctx.occurrences.push({
      id: createOccurrenceId({
        kind: "textual-body",
        annotation: annotationRef,
        body: bodyRef,
        choice,
        targetBody: targetBody
          ? ({
              id: targetBody.ref.id,
              type: "ContentResource",
            } as Reference<"ContentResource">)
          : undefined,
      }),
      path: {
        kind: "textual-body",
        annotation: annotationRef,
        body: bodyRef,
        choice,
        targetBody: targetBody
          ? ({
              id: targetBody.ref.id,
              type: "ContentResource",
            } as Reference<"ContentResource">)
          : undefined,
      },
      resource: {
        id: body.id || bodyRef.id,
        type: "ContentResource",
        label: getResourceDisplayLabel(body, body.id || bodyRef.id),
      },
      propertyLabel: "Annotation body",
      sourceLanguage: ctx.options.sourceLanguage,
      sourceMapLanguage: getTextualBodyLanguage(
        body.language,
        ctx.options.sourceLanguage,
      ),
      targetLanguage: ctx.options.targetLanguage,
      sourceIndex: 0,
      sourceText,
      targetText,
      valueFormat:
        body.format === "text/html" || isHtmlTranslationValue(sourceText)
          ? "html"
          : "text",
      sourceFingerprint: fingerprintTranslationText(sourceText),
      status: normaliseTranslationText(targetText) ? "existing" : "missing",
    });
  }
}

function addLanguageMapOccurrences(
  ctx: CollectContext,
  input: {
    path: TranslationPath;
    resource: TranslationResourceRef;
    propertyLabel: string;
    value: LanguageMapLike;
  },
) {
  if (
    input.path.kind === "resource-language-map" &&
    input.path.resource.type === "Canvas" &&
    input.path.property === "label" &&
    ctx.options.contentFilters?.canvasLabels === false
  ) {
    return;
  }

  const entries = getLanguageMapSourceEntries(
    input.value,
    ctx.options.sourceLanguage,
  );

  for (const entry of entries) {
    const targetText = getLanguageMapTargetText(
      input.value,
      ctx.options.targetLanguage,
      entry.sourceIndex,
    );
    ctx.occurrences.push({
      id: createOccurrenceId(
        input.path,
        entry.sourceMapLanguage,
        entry.sourceIndex,
      ),
      path: input.path,
      resource: input.resource,
      propertyLabel: input.propertyLabel,
      sourceLanguage: ctx.options.sourceLanguage,
      sourceMapLanguage: entry.sourceMapLanguage,
      targetLanguage: ctx.options.targetLanguage,
      sourceIndex: entry.sourceIndex,
      sourceText: entry.sourceText,
      targetText,
      valueFormat: isHtmlTranslationValue(entry.sourceText) ? "html" : "text",
      sourceFingerprint: fingerprintTranslationText(entry.sourceText),
      status: normaliseTranslationText(targetText) ? "existing" : "missing",
    });
  }
}

function createOccurrenceId(
  path: TranslationPath,
  sourceMapLanguage = "text",
  sourceIndex = 0,
) {
  switch (path.kind) {
    case "resource-language-map":
      return `${path.resource.type}:${path.resource.id}:${path.property}:${sourceMapLanguage}:${sourceIndex}`;
    case "metadata-language-map":
      return `${path.resource.type}:${path.resource.id}:metadata:${path.metadataIndex}:${path.field}:${sourceMapLanguage}:${sourceIndex}`;
    case "required-statement-language-map":
      return `${path.resource.type}:${path.resource.id}:requiredStatement:${path.field}:${sourceMapLanguage}:${sourceIndex}`;
    case "textual-body":
      return `${path.annotation.id}:body:${path.choice?.id || "annotation"}:${path.body.id}`;
  }
}

function collectAnnotationBodyResources(
  vault: Vault,
  annotation: any,
): AnnotationBodyResourceEntry[] {
  const entries: AnnotationBodyResourceEntry[] = [];
  for (const ref of toReferences(annotation.body, "ContentResource")) {
    collectAnnotationBodyResource(
      vault,
      ref as Reference<"ContentResource">,
      entries,
    );
  }
  return entries;
}

function collectAnnotationBodyResource(
  vault: Vault,
  ref: Reference<"ContentResource">,
  entries: AnnotationBodyResourceEntry[],
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
    collectAnnotationBodyResource(
      vault,
      itemRef as Reference<"ContentResource">,
      entries,
      ref,
    );
  }
}

function findTextualBodyEntryForLanguage(
  bodies: AnnotationBodyResourceEntry[],
  language: string,
) {
  return bodies.find(({ resource: body }) => {
    if (!isTextualBody(body)) {
      return false;
    }

    if (!normaliseTranslationText(String(body.value || ""))) {
      return false;
    }

    return languageMatches(body.language, language);
  });
}

function isSameTextualBodyContainer(
  choice: Reference<"ContentResource"> | undefined,
  b: AnnotationBodyResourceEntry,
) {
  return (choice?.id || "") === (b.choice?.id || "");
}

function isSourceTextualBody(body: any, sourceLanguage: string) {
  if (!isTextualBody(body) || typeof body.value !== "string") {
    return false;
  }

  if (!body.language) {
    return true;
  }

  return languageMatches(body.language, sourceLanguage);
}

function isTextualBody(body: any) {
  return body?.type === "TextualBody" || body?.type === "Text";
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

function getTextualBodyLanguage(value: unknown, fallback: string) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : fallback;
  }

  return typeof value === "string" ? value : fallback;
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

function getVaultResource(vault: Vault, ref: Reference): any {
  const resource = vault.get(ref as any, { skipSelfReturn: false } as any);
  return resource && typeof resource === "object" ? resource : null;
}

function toResourceRef(resource: any): TranslationResourceRef {
  return {
    id: resource.id,
    type: resource.type,
    label: getResourceDisplayLabel(resource, resource.id || resource.type),
  };
}

function getResourceDisplayLabel(resource: any, fallback: string) {
  if (!resource?.label) {
    return fallback;
  }

  if (typeof resource.label === "string") {
    return resource.label;
  }

  const english = resource.label.en?.find?.((value: string) => value?.trim());
  if (english) {
    return english;
  }

  for (const language of Object.keys(resource.label)) {
    const value = resource.label[language]?.find?.((item: string) =>
      item?.trim(),
    );
    if (value) {
      return value;
    }
  }

  return fallback;
}

function mergeStatus(
  current: TranslationStatus,
  next: TranslationStatus,
): TranslationStatus {
  if (current === "missing" || next === "missing") {
    return "missing";
  }

  if (current === "stale" || next === "stale") {
    return "stale";
  }

  if (current === "skipped" || next === "skipped") {
    return "skipped";
  }

  if (current === "suggested" || next === "suggested") {
    return "suggested";
  }

  return "existing";
}

function statusOrder(status: TranslationStatus) {
  switch (status) {
    case "missing":
      return 0;
    case "stale":
      return 1;
    case "skipped":
      return 2;
    case "suggested":
      return 3;
    case "existing":
      return 4;
  }
}

function getLanguageSortLabel(language: DetectedManifestLanguage) {
  return language.language;
}
