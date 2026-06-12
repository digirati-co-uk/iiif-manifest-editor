import type { InternationalString, Reference } from "@iiif/presentation-3";

export type TranslationRuntimePreference = "auto" | "webgpu" | "wasm";
export type TranslationWritePolicy = "fill-missing";
export type TranslationValueFormat = "text" | "html";
export type TranslationStatus =
  | "missing"
  | "existing"
  | "suggested"
  | "skipped"
  | "stale";

export type TranslationContentFilters = {
  annotationBodies: boolean;
  canvasLabels: boolean;
};

export type TranslationPluginSettings = {
  [key: string]: unknown;
  defaultSourceLanguage?: string;
  defaultTargetLanguage?: string;
  runtimePreference?: TranslationRuntimePreference;
  workerUrl?: string;
};

export type TranslationRunOptions = {
  sourceLanguage: string;
  modelSourceLanguage?: string;
  targetLanguage: string;
  runtime: TranslationRuntimePreference;
  writePolicy: TranslationWritePolicy;
  contentFilters: TranslationContentFilters;
  currentResourceOnly?: boolean;
};

export type TranslationResourceRef = Reference & {
  label?: string;
};

export type ResourceLanguageMapPath = {
  kind: "resource-language-map";
  resource: Reference;
  property: "label" | "summary";
};

export type MetadataLanguageMapPath = {
  kind: "metadata-language-map";
  resource: Reference;
  metadataIndex: number;
  field: "label" | "value";
};

export type RequiredStatementLanguageMapPath = {
  kind: "required-statement-language-map";
  resource: Reference;
  field: "label" | "value";
};

export type TextualBodyPath = {
  kind: "textual-body";
  annotation: Reference<"Annotation">;
  body: Reference<"ContentResource">;
  choice?: Reference<"ContentResource">;
  targetBody?: Reference<"ContentResource">;
};

export type TranslationPath =
  | ResourceLanguageMapPath
  | MetadataLanguageMapPath
  | RequiredStatementLanguageMapPath
  | TextualBodyPath;

export type TranslationOccurrence = {
  id: string;
  path: TranslationPath;
  resource: TranslationResourceRef;
  propertyLabel: string;
  sourceLanguage: string;
  sourceMapLanguage: string;
  targetLanguage: string;
  sourceIndex: number;
  sourceText: string;
  targetText: string;
  valueFormat: TranslationValueFormat;
  sourceFingerprint: string;
  status: TranslationStatus;
};

export type TranslationTarget = {
  key: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  normalisedSourceText: string;
  valueFormat: TranslationValueFormat;
  occurrences: TranslationOccurrence[];
  status: TranslationStatus;
};

export type TranslationTaskResult =
  | {
      type: "translated";
      key: string;
      sourceText: string;
      translationText: string;
      applied: number;
      existing: number;
      stale: number;
    }
  | {
      type: "skipped";
      key: string;
      sourceText: string;
      reason: string;
      existing?: number;
      stale?: number;
    };

export type TranslationActionResult = {
  total: number;
  translated: number;
  applied: number;
  skipped: number;
  existing: number;
  stale: number;
  errors: number;
  translations: Array<{
    key: string;
    sourceText: string;
    translationText: string;
    applied: number;
  }>;
  skippedTargets: Array<{
    key: string;
    sourceText: string;
    reason: string;
  }>;
};

export type LanguageMapLike = InternationalString | string | null | undefined;
